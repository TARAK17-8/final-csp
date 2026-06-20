// ═══════════════════════════════════════════════════════════════
// samaramAI — Prescription Translator Routes (Groq AI)
// Pipeline: Image → Google Vision OCR → Groq Cleanup →
//           Groq Translation + Explanation + Medicine Table
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import { extractTextFromImage } from '../services/visionService.js';
import { askGroqWithFallback, PROMPTS } from '../services/groqService.js';

export const prescriptionTranslatorRouter = Router();

// ── Allowed MIME types ──
const ALLOWED_MIME_PREFIXES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validate base64 image data.
 * Returns { valid, error } object.
 */
function validateImage(imageData) {
  if (!imageData || typeof imageData !== 'string') {
    return { valid: false, error: 'Image data is required' };
  }

  // Check if base64 string is too large (~10MB limit for decoded)
  const estimatedSize = (imageData.length * 3) / 4;
  if (estimatedSize > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: 'Image file is too large. Maximum size is 10MB.' };
  }

  // Basic base64 format validation
  if (imageData.length < 100) {
    return { valid: false, error: 'Image data appears to be corrupted or empty.' };
  }

  return { valid: true };
}

/**
 * Sanitize user input text to prevent prompt injection.
 */
function sanitizeInput(text) {
  if (!text || typeof text !== 'string') return '';
  // Remove potential prompt injection patterns
  return text
    .replace(/```/g, '')
    .replace(/system:/gi, '')
    .replace(/ignore previous/gi, '')
    .replace(/forget all/gi, '')
    .trim()
    .slice(0, 500); // Limit language input length
}

// ────────────────────────────────────────────────────────────
// POST /api/prescription-translator/translate
// Full prescription translation pipeline
// ────────────────────────────────────────────────────────────
prescriptionTranslatorRouter.post('/translate', async (req, res) => {
  try {
    const { image, language, userProfile } = req.body;

    // ── Step 0: Input Validation ──
    const validation = validateImage(image);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const targetLanguage = sanitizeInput(language) || 'English';

    // ── Step 1: Google Vision OCR ──
    let ocrResult;
    try {
      ocrResult = await extractTextFromImage(image);
    } catch (ocrError) {
      console.error('[PrescriptionTranslator] Vision API Error:', ocrError.message);
      return res.status(502).json({
        success: false,
        error: 'OCR service is temporarily unavailable. Please try again later.',
        stage: 'ocr',
      });
    }

    if (!ocrResult.success || !ocrResult.fullText) {
      return res.status(422).json({
        success: false,
        error: 'Could not read text from the prescription image. Please try a clearer photo with good lighting.',
        stage: 'ocr',
      });
    }

    const rawOcrText = ocrResult.fullText;

    // ── Step 2: Groq AI — OCR Cleanup ──
    let cleanupResult;
    try {
      const cleanupMessage = `Raw OCR text from prescription image:\n\n"${rawOcrText}"\n\nClean up this OCR text while preserving all medical content exactly.`;
      cleanupResult = await askGroqWithFallback(PROMPTS.PRESCRIPTION_OCR_CLEANUP, cleanupMessage, 0.1);
    } catch (cleanupError) {
      console.error('[PrescriptionTranslator] Cleanup Error:', cleanupError.message);
      // If cleanup fails, proceed with raw OCR text
      cleanupResult = {
        cleanedText: rawOcrText,
        confidence: 'low',
        confidenceScore: 30,
        unclearSections: [],
        detectedLanguage: 'Unknown',
        preservedElements: {
          medicineNames: [],
          dosages: [],
          doctorName: null,
          hospitalName: null,
          dates: [],
        },
      };
    }

    const cleanedText = cleanupResult.cleanedText || rawOcrText;

    // ── Step 3: Groq AI — Translation + Explanation + Medicine Table ──
    let translationResult;
    try {
      const translationMessage = `Prescription text (cleaned OCR):\n\n"${cleanedText}"\n\nTarget language: ${targetLanguage}\nPatient age: ${userProfile?.age || 'Unknown'}\nPatient conditions: ${userProfile?.chronicConditions?.join(', ') || 'None specified'}\n\nTranslate this prescription into ${targetLanguage}, generate a patient-friendly explanation, and extract the medicine table.`;

      translationResult = await askGroqWithFallback(PROMPTS.PRESCRIPTION_FULL_TRANSLATION, translationMessage, 0.2);
    } catch (translationError) {
      console.error('[PrescriptionTranslator] Translation Error:', translationError.message);
      return res.status(502).json({
        success: false,
        error: 'Translation service is temporarily unavailable. Please try again.',
        stage: 'translation',
      });
    }

    // ── Step 4: Assemble Response ──
    const response = {
      ocrText: rawOcrText,
      cleanedText: cleanedText,
      translatedText: translationResult.translatedText || cleanedText,
      explanation: translationResult.explanation || '',
      medicineTable: (translationResult.medicineTable || []).map((m) => ({
        medicineName: m.medicineName || 'Unknown',
        dosage: m.dosage || 'Not specified in prescription',
        frequency: m.frequency || 'Not specified in prescription',
        duration: m.duration || 'Not specified in prescription',
        specialInstructions: m.specialInstructions || 'Not specified in prescription',
      })),
      generalInstructions: translationResult.generalInstructions || null,
      followUpNote: translationResult.followUpNote || null,
      confidence: (['high', 'medium', 'low'].includes((cleanupResult.confidence || '').toLowerCase()))
        ? cleanupResult.confidence.toLowerCase()
        : 'medium',
      confidenceScore: typeof cleanupResult.confidenceScore === 'number' ? cleanupResult.confidenceScore : 50,
      unclearSections: cleanupResult.unclearSections || [],
      detectedLanguage: cleanupResult.detectedLanguage || 'Unknown',
      preservedElements: cleanupResult.preservedElements || {},
      targetLanguage: targetLanguage,
      safetyNotice: 'AI-generated translation. Please verify all prescription details with a qualified healthcare professional before taking any medication.',
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('[PrescriptionTranslator] Unexpected Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Prescription translation failed. Please try again.',
    });
  }
});
