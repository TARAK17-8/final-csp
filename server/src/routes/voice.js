// ═══════════════════════════════════════════════════════════════
// samaramAI — Voice Phrase Mapping Routes (Groq AI)
// Maps colloquial Indian medical phrases to clinical terms
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import { askGroq, PROMPTS } from '../services/groqService.js';

export const voiceRouter = Router();

// POST /api/voice/map — Map spoken phrase to medical meaning
voiceRouter.post('/map', async (req, res) => {
  try {
    const { phrase, language } = req.body;

    if (!phrase || phrase.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a spoken phrase to map.',
      });
    }

    const userMessage = `Spoken phrase: "${phrase}"
Detected language: ${language || 'auto-detect'}

Map this spoken phrase to its medical meaning. Handle Telugu, Hindi, Tamil, Kannada, and English colloquial medical expressions.`;

    const result = await askGroq(PROMPTS.VOICE_PHRASE_MAP, userMessage, 0.3);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Voice/Map]', error.message);
    res.status(500).json({
      success: false,
      error: 'Phrase mapping failed. Please try again.',
    });
  }
});
