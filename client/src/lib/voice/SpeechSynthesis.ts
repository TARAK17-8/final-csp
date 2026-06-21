// ═══════════════════════════════════════════════════════════════
// samaramAI — Voice Synthesis Service (TTS)
// AI loop prevention: disables mic while speaking
// ═══════════════════════════════════════════════════════════════

import { useVoiceStore } from '@/stores/voiceStore';

class SpeechSynthesisService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
    
    // Voices might be loaded asynchronously
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    } else {
      this.voices = this.synth.getVoices();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public getVoicesForLanguage(langCode: string): SpeechSynthesisVoice[] {
    const allVoices = this.getVoices();
    return allVoices.filter(v => v.lang.startsWith(langCode));
  }

  public speak(text: string, langCode: string = 'en') {
    const voiceState = useVoiceStore.getState();
    if (voiceState.isMuted) return;

    // Stop any ongoing speech
    this.cancel();

    // Split text into smaller chunks to prevent browser TTS from stopping at paragraphs or timeouts
    const chunks = text
      .split(/\n+/)
      .reduce((acc: string[], curr: string) => acc.concat(curr.split(/(?<=[.!?])\s+/)), [])
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (chunks.length === 0) return;

    // Use ai_speaking state
    useVoiceStore.getState().setState('ai_speaking');

    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      
      utterance.rate = voiceState.speed;
      utterance.lang = langCode;
      
      const availableVoices = this.getVoicesForLanguage(langCode);
      if (voiceState.voiceURI) {
        const preferred = this.voices.find(v => v.voiceURI === voiceState.voiceURI);
        if (preferred) utterance.voice = preferred;
      } else if (availableVoices.length > 0) {
        const googleVoice = availableVoices.find(v => v.name.includes('Google'));
        utterance.voice = googleVoice || availableVoices[0];
      }

      if (index === chunks.length - 1) {
        utterance.onend = () => {
          const state = useVoiceStore.getState();
          if (state.state === 'ai_speaking') {
            state.setState('idle');
            // Resume continuous listening if enabled
            if (state.isContinuousMode) {
              setTimeout(() => {
                window.dispatchEvent(new Event('resume-listening'));
              }, 400);
            }
          }
        };

        utterance.onerror = (e) => {
          console.error('Speech synthesis error:', e);
          const state = useVoiceStore.getState();
          if (state.state === 'ai_speaking') {
            state.setState('idle');
          }
        };
      }

      this.synth.speak(utterance);
    });
  }

  public pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      useVoiceStore.getState().setState('ai_paused');
    }
  }

  public resume() {
    if (this.synth.paused) {
      this.synth.resume();
      useVoiceStore.getState().setState('ai_speaking');
    }
  }

  public cancel() {
    if (this.synth.speaking || this.synth.paused || this.synth.pending) {
      this.synth.cancel();
    }
    const state = useVoiceStore.getState();
    if (state.state === 'ai_speaking' || state.state === 'ai_paused') {
      state.setState('idle');
    }
  }
}

export const speechSynthesizer = new SpeechSynthesisService();
