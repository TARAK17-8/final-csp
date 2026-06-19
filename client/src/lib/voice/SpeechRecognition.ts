// ═══════════════════════════════════════════════════════════════
// samaramAI — Voice Recognition Service (STT)
// ChatGPT-style real-time voice with silence detection
// ═══════════════════════════════════════════════════════════════

import { useVoiceStore } from '@/stores/voiceStore';
import api from '@/lib/api';

// Web Speech API interfaces
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

// ── Configuration ──
const SILENCE_TIMEOUT_MS = 1500;       // Auto-submit after 1.5s of silence
const QUICK_MATCH_TIMEOUT_MS = 600;    // For symptom checker: fast option match timeout
const MAX_RECOGNITION_TIME_MS = 30000; // Safety cap: 30s max listening per session

// ── Callback types for external consumers ──
export type OnAutoSubmitCallback = (finalText: string) => void;
export type OnOptionMatchCallback = (matchedOption: string) => void;

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private language = 'en';
  private wakeWord = 'hello samaram';

  // ── Silence detection ──
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private safetyTimer: ReturnType<typeof setTimeout> | null = null;
  private accumulatedFinal = '';
  private lastInterim = '';

  // ── Callbacks for external consumers ──
  private onAutoSubmit: OnAutoSubmitCallback | null = null;
  private onOptionMatch: OnOptionMatchCallback | null = null;
  private availableOptions: string[] = [];

  // ── Prevent double starts ──
  private isActive = false;

  constructor() {
    this.initNativeRecognition();
  }

  // ════════════════════════════════════════════════════
  // Initialization: Wire up the Web Speech API events
  // ════════════════════════════════════════════════════
  private initNativeRecognition() {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    this.recognition = new SpeechRecognitionAPI();
    // continuous=false gives faster onend firing (ChatGPT-style single-utterance)
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    // ── onstart ──
    this.recognition.onstart = () => {
      this.isActive = true;
      useVoiceStore.getState().setState('listening');
    };

    // ── onresult — the heart of real-time transcription ──
    this.recognition.onresult = (event) => {
      const store = useVoiceStore.getState();
      // Don't process results if we're no longer in listening state
      if (store.state !== 'listening') return;

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      // ── Wake-word detection (continuous mode only) ──
      if (store.isContinuousMode && finalTranscript.toLowerCase().includes(this.wakeWord)) {
        finalTranscript = finalTranscript.replace(new RegExp(this.wakeWord, 'ig'), '').trim();
      }

      // ── Accumulate final transcript pieces ──
      if (finalTranscript) {
        this.accumulatedFinal = this.accumulatedFinal
          ? `${this.accumulatedFinal} ${finalTranscript}`.trim()
          : finalTranscript.trim();
        store.setTranscript(this.accumulatedFinal);
        store.setInterimTranscript('');
      }

      // ── Push interim transcript for live display ──
      if (interimTranscript) {
        this.lastInterim = interimTranscript;
        store.setInterimTranscript(interimTranscript);
      }

      // ── Symptom checker: instant option matching on every result ──
      const textToMatch = (this.accumulatedFinal + ' ' + interimTranscript).trim();
      if (this.availableOptions.length > 0 && textToMatch) {
        const matched = this.fuzzyMatchOption(textToMatch, this.availableOptions);
        if (matched) {
          // Immediately stop and dispatch the match
          this.clearAllTimers();
          this.stopRecognitionEngine();
          store.setTranscript(matched);
          store.setInterimTranscript('');
          store.setState('submitted');
          this.onOptionMatch?.(matched);
          return;
        }
      }

      // ── Reset silence timer on every new speech input ──
      this.resetSilenceTimer();
    };

    // ── onspeechend — user stopped talking ──
    this.recognition.onspeechend = () => {
      // If we have accumulated text, start a shorter silence timer
      if (this.accumulatedFinal || this.lastInterim) {
        this.clearSilenceTimer();
        this.silenceTimer = setTimeout(() => {
          this.finalizeAndSubmit();
        }, QUICK_MATCH_TIMEOUT_MS);
      }
    };

    // ── onerror ──
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      const store = useVoiceStore.getState();

      if (event.error === 'not-allowed') {
        this.cleanup();
        store.setState('error', 'Microphone access denied. Please enable it in your browser settings.');
      } else if (event.error === 'no-speech') {
        // User didn't say anything — just reset quietly
        this.cleanup();
        store.setState('idle');
      } else if (event.error === 'network') {
        // Try fallback recording
        this.cleanup();
        this.startFallbackRecording();
      } else if (event.error === 'aborted') {
        // Intentional abort — do nothing
        this.isActive = false;
      } else {
        this.cleanup();
        this.startFallbackRecording();
      }
    };

    // ── onend — recognition session ended ──
    this.recognition.onend = () => {
      this.isActive = false;
      const store = useVoiceStore.getState();

      // If we have unflushed text and we're still in listening state, finalize
      if (store.state === 'listening' && (this.accumulatedFinal || this.lastInterim)) {
        this.finalizeAndSubmit();
        return;
      }

      // In continuous mode, auto-restart if we haven't submitted or spoken
      if (store.isContinuousMode && store.state === 'listening') {
        try {
          setTimeout(() => {
            const s = useVoiceStore.getState();
            if (s.isContinuousMode && s.state !== 'ai_speaking' && s.state !== 'submitted') {
              this.recognition?.start();
            }
          }, 100);
        } catch {
          // Ignore
        }
        return;
      }

      // Default: if still listening and nothing submitted, go idle
      if (store.state === 'listening') {
        store.setState('idle');
      }
    };
  }

  // ════════════════════════════════════════════════════
  // Silence Detection
  // ════════════════════════════════════════════════════
  private resetSilenceTimer() {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      this.finalizeAndSubmit();
    }, SILENCE_TIMEOUT_MS);
  }

  private clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private clearAllTimers() {
    this.clearSilenceTimer();
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
  }

  // ════════════════════════════════════════════════════
  // Finalize: Take whatever we have and submit it
  // ════════════════════════════════════════════════════
  private finalizeAndSubmit() {
    this.clearAllTimers();
    const store = useVoiceStore.getState();

    // If interim text hasn't been finalized yet, promote it
    const finalText = (this.accumulatedFinal + (this.lastInterim ? ' ' + this.lastInterim : '')).trim();
    
    if (!finalText) {
      // Nothing to submit
      this.stopRecognitionEngine();
      store.setState('idle');
      return;
    }

    // Stop the recognition engine
    this.stopRecognitionEngine();

    // Update store with the final text
    store.setTranscript(finalText);
    store.setInterimTranscript('');
    store.setState('submitted');

    // Trigger the auto-submit callback
    this.onAutoSubmit?.(finalText);
  }

  private stopRecognitionEngine() {
    if (this.recognition && this.isActive) {
      try {
        this.recognition.abort(); // abort is faster than stop — no final onresult
      } catch {
        // Ignore
      }
      this.isActive = false;
    }
  }

  private cleanup() {
    this.clearAllTimers();
    this.accumulatedFinal = '';
    this.lastInterim = '';
    this.isActive = false;
  }

  // ════════════════════════════════════════════════════
  // Fuzzy Option Matching (Symptom Checker)
  // ════════════════════════════════════════════════════
  private fuzzyMatchOption(spokenText: string, options: string[]): string | null {
    const spoken = spokenText.toLowerCase().trim();
    if (!spoken) return null;

    // ── Synonym dictionary ──
    const synonymMap: Record<string, string[]> = {
      'yes': ['yes', 'yeah', 'yep', 'yea', 'ya', 'sure', 'correct', 'right', 'affirmative', 'absolutely', 'definitely', 'of course', 'haan', 'ha', 'avunu', 'aamam'],
      'no': ['no', 'nope', 'nah', 'nay', 'not', 'never', 'negative', 'nahin', 'nahi', 'ledu', 'illa'],
      'mild': ['mild', 'little', 'slight', 'minor', 'small', 'a bit', 'not much', 'light', 'low'],
      'moderate': ['moderate', 'medium', 'average', 'middle', 'somewhat', 'fairly', 'normal'],
      'severe': ['severe', 'bad', 'terrible', 'awful', 'extreme', 'intense', 'very bad', 'worst', 'unbearable', 'high', 'heavy', 'serious', 'critical'],
      'today': ['today', 'just now', 'right now', 'this morning', 'this evening', 'few hours', 'just started'],
      'a few days ago': ['few days', 'couple days', 'two days', 'three days', '2 days', '3 days', 'day before', 'yesterday'],
      'about a week ago': ['week', 'last week', 'seven days', '7 days', 'one week'],
      'more than a week ago': ['more than a week', 'long time', 'weeks', 'month', 'months', 'several weeks'],
      'comes and goes': ['comes and goes', 'intermittent', 'on and off', 'sometimes'],
      'constant': ['constant', 'continuous', 'always', 'all the time', 'non stop', 'persistent'],
      'getting worse': ['getting worse', 'worse', 'worsening', 'increasing', 'escalating'],
      'getting better': ['getting better', 'better', 'improving', 'decreasing', 'less'],
      'sharp pain': ['sharp', 'stabbing', 'piercing', 'shooting'],
      'dull ache': ['dull', 'ache', 'aching', 'throbbing', 'sore'],
      'burning': ['burning', 'burn', 'hot', 'stinging'],
      'pressure or tightness': ['pressure', 'tight', 'tightness', 'squeezing', 'heavy'],
      'fever or chills': ['fever', 'chills', 'temperature', 'hot', 'cold'],
      'nausea': ['nausea', 'nauseous', 'vomiting', 'vomit', 'sick', 'queasy'],
      'difficulty breathing': ['breathing', 'breathe', 'breath', 'shortness', 'panting', 'gasping'],
      'none of these': ['none', 'nothing', 'no other', 'that is it', "that's it", 'only this'],
      'over-the-counter medicine': ['over the counter', 'otc', 'paracetamol', 'ibuprofen', 'medicine from pharmacy', 'tablet'],
      'home remedies': ['home', 'home remedy', 'natural', 'herbal', 'traditional', 'turmeric', 'ginger'],
      'prescription medicine': ['prescription', 'doctor medicine', 'prescribed', 'doctor gave'],
      'nothing yet': ['nothing', 'no medicine', 'nothing yet', 'not taken', 'no treatment'],
    };

    // ── Phase 1: Exact match ──
    for (const option of options) {
      if (spoken === option.toLowerCase()) {
        return option;
      }
    }

    // ── Phase 2: Synonym / alias match ──
    for (const option of options) {
      const optionLower = option.toLowerCase();
      const aliases = synonymMap[optionLower];
      if (aliases) {
        for (const alias of aliases) {
          if (spoken === alias || spoken.includes(alias) || alias.includes(spoken)) {
            return option;
          }
        }
      }
    }

    // ── Phase 3: Substring / partial match ──
    for (const option of options) {
      const optionLower = option.toLowerCase();
      if (spoken.includes(optionLower) || optionLower.includes(spoken)) {
        return option;
      }
    }

    // ── Phase 4: Word overlap scoring ──
    const spokenWords = spoken.split(/\s+/);
    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const option of options) {
      const optionWords = option.toLowerCase().split(/\s+/);
      let score = 0;
      for (const sw of spokenWords) {
        for (const ow of optionWords) {
          if (sw === ow) score += 2;
          else if (sw.includes(ow) || ow.includes(sw)) score += 1;
        }
      }
      // Also check synonyms for word-level matching
      const aliases = synonymMap[option.toLowerCase()] || [];
      for (const alias of aliases) {
        for (const sw of spokenWords) {
          if (sw === alias) score += 2;
          else if (alias.split(/\s+/).some(aw => sw === aw)) score += 1;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = option;
      }
    }

    // Require at least a score of 2 for a confident match
    if (bestScore >= 2 && bestMatch) {
      return bestMatch;
    }

    return null;
  }

  // ════════════════════════════════════════════════════
  // Public API
  // ════════════════════════════════════════════════════

  public setLanguage(langCode: string) {
    this.language = langCode;
    if (this.recognition) {
      const langMap: Record<string, string> = {
        'en': 'en-IN',
        'te': 'te-IN',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN',
      };
      this.recognition.lang = langMap[langCode] || langCode;
    }
  }

  /**
   * Register a callback to fire when silence detection triggers auto-submit.
   */
  public setOnAutoSubmit(cb: OnAutoSubmitCallback | null) {
    this.onAutoSubmit = cb;
  }

  /**
   * Register a callback to fire when a spoken option is matched (symptom checker).
   * Also pass in the available options to match against.
   */
  public setOptionMatcher(options: string[], cb: OnOptionMatchCallback | null) {
    this.availableOptions = options;
    this.onOptionMatch = cb;
  }

  /**
   * Clear option matching (when leaving symptom checker or between questions).
   */
  public clearOptionMatcher() {
    this.availableOptions = [];
    this.onOptionMatch = null;
  }

  /**
   * Start listening — clears previous state and begins a fresh session.
   */
  public async startListening() {
    // Prevent double-start
    if (this.isActive) return;

    const store = useVoiceStore.getState();
    // Don't start if AI is speaking
    if (store.state === 'ai_speaking') return;

    // Reset buffers
    this.accumulatedFinal = '';
    this.lastInterim = '';
    this.clearAllTimers();

    store.clearTranscript();
    store.setState('listening');

    if (this.recognition) {
      try {
        this.recognition.start();

        // Safety timer: auto-stop after MAX_RECOGNITION_TIME_MS
        this.safetyTimer = setTimeout(() => {
          if (this.isActive) {
            this.finalizeAndSubmit();
          }
        }, MAX_RECOGNITION_TIME_MS);

        return;
      } catch (error) {
        console.error('Failed to start native recognition:', error);
        // Fall through to fallback
      }
    }

    await this.startFallbackRecording();
  }

  /**
   * Stop listening — gracefully finalizes if there's pending text.
   */
  public stopListening() {
    this.clearAllTimers();

    if (this.recognition && this.isActive) {
      // If we have accumulated text, submit it
      if (this.accumulatedFinal || this.lastInterim) {
        this.finalizeAndSubmit();
      } else {
        this.stopRecognitionEngine();
        const store = useVoiceStore.getState();
        if (store.state === 'listening') {
          store.setState('idle');
        }
      }
    }

    if (this.isRecording && this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
  }

  // ════════════════════════════════════════════════════
  // Fallback: MediaRecorder + Whisper API
  // ════════════════════════════════════════════════════
  private async startFallbackRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.isRecording = true;

      useVoiceStore.getState().setState('listening');

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        this.isRecording = false;
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          await this.processFallbackAudio(audioBlob);
        } else {
          useVoiceStore.getState().setState('idle');
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Fallback recording error:', error);
      useVoiceStore.getState().setState('error', 'Microphone access denied or not supported.');
    }
  }

  private async processFallbackAudio(blob: Blob) {
    const store = useVoiceStore.getState();
    store.setState('processing');

    const formData = new FormData();
    formData.append('audio', blob, 'speech.webm');
    formData.append('language', this.language);

    try {
      const response = await api.post('/voice/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        const text = response.data.data.text;
        store.setTranscript(text);
        store.setState('submitted');
        this.onAutoSubmit?.(text);
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      store.setState('error', 'Failed to understand speech. Please try again.');
    }
  }
}

export const speechRecognizer = new SpeechRecognitionService();

// Listen for resume event from TTS
window.addEventListener('resume-listening', () => {
  const state = useVoiceStore.getState();
  if (state.isContinuousMode && state.state !== 'listening' && state.state !== 'ai_speaking') {
    speechRecognizer.startListening();
  }
});
