// ═══════════════════════════════════════════════════════════════
// samaramAI — UI Translation Route
// Dynamically translates UI keys to requested languages via Groq.
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import { askGroq, PROMPTS } from '../services/groqService.js';

export const translateRouter = Router();

translateRouter.post('/ui', async (req, res) => {
  try {
    const { targetLanguageName, sourceKeys } = req.body;

    if (!targetLanguageName || !sourceKeys || typeof sourceKeys !== 'object') {
      return res.status(400).json({ success: false, error: 'targetLanguageName and valid sourceKeys are required' });
    }

    // Convert keys object to string for the prompt
    const sourceJson = JSON.stringify(sourceKeys, null, 2);

    const userMessage = `Target Language: ${targetLanguageName}

JSON Object to translate:
${sourceJson}

Please translate all values into ${targetLanguageName} while keeping the keys exactly as they are.`;

    // 0.1 temperature for more accurate translation without creative deviation
    const result = await askGroq(PROMPTS.UI_TRANSLATION, userMessage, 0.1);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Translate/UI]', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to translate UI strings.',
    });
  }
});
