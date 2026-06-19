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

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply preferences
    utterance.rate = voiceState.speed;
    
    // Find best voice
    const availableVoices = this.getVoicesForLanguage(langCode);
    if (voiceState.voiceURI) {
      const preferred = this.voices.find(v => v.voiceURI === voiceState.voiceURI);
      if (preferred) utterance.voice = preferred;
    } else if (availableVoices.length > 0) {
      // Pick a default voice for the language (Google voices are usually better)
      const googleVoice = availableVoices.find(v => v.name.includes('Google'));
      utterance.voice = googleVoice || availableVoices[0];
    }

    utterance.onstart = () => {
      // Use ai_speaking state — this prevents the mic from activating
      useVoiceStore.getState().setState('ai_speaking');
    };

    utterance.onend = () => {
      const state = useVoiceStore.getState();
      if (state.state === 'ai_speaking') {
        state.setState('idle');
        // Resume continuous listening if enabled — with a delay to prevent echo
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

    this.synth.speak(utterance);
  }

  public cancel() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
  }
}

export const speechSynthesizer = new SpeechSynthesisService();
