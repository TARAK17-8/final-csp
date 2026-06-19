// ═══════════════════════════════════════════════════════════════
// samaramAI — Speech Service (Whisper API Wrapper)
// ═══════════════════════════════════════════════════════════════

import fs from 'fs';
import { transcribeAudio } from './groqService.js';

/**
 * Service to handle speech-to-text using Groq Whisper API
 */
export const speechService = {
  /**
   * Transcribe an audio file using Groq Whisper
   * @param {string} filePath - Path to the saved audio file
   * @param {string} language - ISO language code
   * @returns {Promise<string>} Transcribed text
   */
  async transcribe(filePath, language) {
    try {
      // Create a readable stream from the file
      const fileStream = fs.createReadStream(filePath);
      
      // Call Groq whisper API
      const text = await transcribeAudio(fileStream, language);
      
      // Cleanup the temp file after reading
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Failed to delete temp audio file: ${filePath}`, err);
      });
      
      return text;
    } catch (error) {
      console.error('[SpeechService] Transcription failed:', error);
      // Attempt cleanup even on failure
      fs.unlink(filePath, () => {});
      throw error;
    }
  }
};
