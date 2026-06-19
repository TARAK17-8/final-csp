// ═══════════════════════════════════════════════════════════════
// samaramAI — Prescription Translation Routes (Groq AI)
// Google Vision OCR → Groq AI interpretation
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import { extractTextFromImage } from '../services/visionService.js';
import { askGroq, PROMPTS } from '../services/groqService.js';

export const prescriptionRouter = Router();

// POST /api/prescription/translate — Full prescription translation pipeline
prescriptionRouter.post('/translate', async (req, res) => {
  try {
    const { image, prescriptionText, language, userProfile } = req.body;

    let rawText = prescriptionText || '';

    // If image provided, run OCR first
    if (image && !rawText) {
      const ocrResult = await extractTextFromImage(image);
      if (!ocrResult.success || !ocrResult.fullText) {
        return res.status(422).json({
          success: false,
          error: 'Could not read the prescription. Please try a clearer photo or type the prescription details.',
        });
      }
      rawText = ocrResult.fullText;
    }

    if (!rawText) {
      return res.status(400).json({
        success: false,
        error: 'Either image or prescriptionText is required',
      });
    }

    const userMessage = `Raw prescription text: "${rawText}"

Patient language preference: ${language || 'English'}
Patient age: ${userProfile?.age || 'Unknown'}, conditions: ${userProfile?.chronicConditions?.join(', ') || 'None'}

Translate this prescription into simple, patient-friendly language.`;

    const result = await askGroq(PROMPTS.PRESCRIPTION_TRANSLATION, userMessage, 0.2);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Prescription/Translate]', error.message);
    res.status(500).json({
      success: false,
      error: 'Prescription translation failed. Please try again.',
    });
  }
});
