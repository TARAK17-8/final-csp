// ═══════════════════════════════════════════════════════════════
// samaramAI — TTS Service Stub
// ═══════════════════════════════════════════════════════════════

/**
 * Service to handle Text-to-Speech related configurations.
 * Note: Actual TTS audio generation is handled primarily by the client-side
 * Web Speech API (window.speechSynthesis) to minimize latency and server load.
 * This service is reserved for future fallback TTS APIs (e.g., Google Cloud TTS or ElevenLabs).
 */
export const ttsService = {
  getAvailableVoices() {
    // Stub for backend-available voices if needed in the future
    return [];
  },
  
  async synthesizeSpeech(text, language) {
    // Stub for backend TTS generation
    throw new Error('Backend TTS not implemented. Use client-side SpeechSynthesis.');
  }
};
