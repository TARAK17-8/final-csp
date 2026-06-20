// ═══════════════════════════════════════════════════════════════
// samaramAI — Medicine Routes (Groq AI Intelligence)
// Pipeline: Google Vision OCR → Groq AI interpretation
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import { extractTextFromImage } from '../services/visionService.js';
import { askGroq, PROMPTS } from '../services/groqService.js';

export const medicineRouter = Router();

const ensureArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return val ? [val] : [];
};

// ────────────────────────────────────────────────────────────
// POST /api/medicine/scan — Full scan pipeline
// Step 1: Google Vision OCR extracts raw text
// Step 2: Grok AI interprets everything
// ────────────────────────────────────────────────────────────
medicineRouter.post('/scan', async (req, res) => {
  try {
    const { image, userMedications, userProfile, language } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: 'image (base64) is required' });
    }

    // Step 1: Google Vision OCR
    const ocrResult = await extractTextFromImage(image);

    if (!ocrResult.success || !ocrResult.fullText) {
      return res.status(422).json({
        success: false,
        error: 'Could not read text from image. Please try a clearer photo or type the medicine name.',
        data: { extractedText: ocrResult.fullText || '' },
      });
    }

    // Step 2: Grok AI interprets the OCR text
    const userMessage = `OCR text from medicine image: "${ocrResult.fullText}"

Patient current medicines: ${(userMedications || []).join(', ') || 'None specified'}
Patient conditions: ${userProfile?.chronicConditions?.join(', ') || 'None specified'}
Patient age: ${userProfile?.age || 'Unknown'}

Identify this medicine and provide complete information including interaction checks.
IMPORTANT: The patient's language is "${language || 'en'}". You MUST translate the following fields into this language (return the JSON values in this language):
- whatItTreats
- howToTake
- commonSideEffects
- seriousSideEffects
- storageInstructions
- doNotTakeWith
- interactions.description
- interactions.action
- patientSpecificWarnings
DO NOT translate the brandName or genericName. They should remain in English.`;

    const grokResult = await askGroq(PROMPTS.MEDICINE_IDENTIFICATION, userMessage, 0.1);

    // Normalize response to match frontend's expected shape
    const normalizedResult = {
      identity: {
        brandName: grokResult.brandName || 'Unknown Medicine',
        genericName: grokResult.genericName || '',
        strength: grokResult.strength || '',
        form: grokResult.form || 'tablet',
        manufacturer: grokResult.manufacturer || '',
        expiryDate: grokResult.expiryDate || '',
        batchNumber: '',
        storageInstructions: grokResult.storageInstructions || 'Store in a cool, dry place below 30°C',
      },
      purpose: grokResult.whatItTreats || '',
      howToTake: grokResult.howToTake || '',
      sideEffects: {
        common: ensureArray(grokResult.commonSideEffects),
        serious: ensureArray(grokResult.seriousSideEffects),
      },
      contraindications: ensureArray(grokResult.doNotTakeWith),
      interactions: (grokResult.interactions || []).map((i) => ({
        medicationName: i.medicine,
        severity: { minor: 1, moderate: 2, major: 4, contraindicated: 5 }[i.severity] || 2,
        description: i.description,
        recommendation: i.action,
      })),
      expiryStatus: grokResult.isExpired ? 'expired' : grokResult.expiringSoon ? 'expiring_soon' : 'safe',
      warningLevel: grokResult.warningLevel || 'safe',
      patientSpecificWarnings: ensureArray(grokResult.patientSpecificWarnings),
    };

    res.json({ success: true, data: normalizedResult });
  } catch (error) {
    console.error('[Medicine/Scan]', error.message);
    res.status(500).json({
      success: false,
      error: 'Scan failed. Please try again or type the medicine name manually.',
    });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/medicine/lookup — Look up medicine by name
// Grok AI provides all information directly
// ────────────────────────────────────────────────────────────
medicineRouter.post('/lookup', async (req, res) => {
  try {
    const { medicineName, userMedications, userProfile, language } = req.body;

    if (!medicineName) {
      return res.status(400).json({ success: false, error: 'medicineName is required' });
    }

    const userMessage = `OCR text from medicine image: "${medicineName}"

Patient current medicines: ${(userMedications || []).join(', ') || 'None specified'}
Patient conditions: ${userProfile?.chronicConditions?.join(', ') || 'None specified'}
Patient age: ${userProfile?.age || 'Unknown'}

Identify this medicine and provide complete information.
IMPORTANT: The patient's language is "${language || 'en'}". You MUST translate the following fields into this language (return the JSON values in this language):
- whatItTreats
- howToTake
- commonSideEffects
- seriousSideEffects
- storageInstructions
- doNotTakeWith
- interactions.description
- interactions.action
- patientSpecificWarnings
DO NOT translate the brandName or genericName. They should remain in English.`;

    const grokResult = await askGroq(PROMPTS.MEDICINE_IDENTIFICATION, userMessage, 0.1);

    const normalizedResult = {
      identity: {
        brandName: grokResult.brandName || medicineName,
        genericName: grokResult.genericName || '',
        strength: grokResult.strength || '',
        form: grokResult.form || 'tablet',
        manufacturer: grokResult.manufacturer || '',
        expiryDate: '',
        batchNumber: '',
        storageInstructions: grokResult.storageInstructions || '',
      },
      purpose: grokResult.whatItTreats || '',
      howToTake: grokResult.howToTake || '',
      sideEffects: {
        common: ensureArray(grokResult.commonSideEffects),
        serious: ensureArray(grokResult.seriousSideEffects),
      },
      contraindications: ensureArray(grokResult.doNotTakeWith),
      interactions: (grokResult.interactions || []).map((i) => ({
        medicationName: i.medicine,
        severity: { minor: 1, moderate: 2, major: 4, contraindicated: 5 }[i.severity] || 2,
        description: i.description,
        recommendation: i.action,
      })),
      expiryStatus: 'safe',
      warningLevel: grokResult.warningLevel || 'safe',
      patientSpecificWarnings: ensureArray(grokResult.patientSpecificWarnings),
    };

    res.json({ success: true, data: normalizedResult });
  } catch (error) {
    console.error('[Medicine/Lookup]', error.message);
    res.status(500).json({ success: false, error: 'Lookup failed.' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/medicine/interactions — Standalone interaction check
// ────────────────────────────────────────────────────────────
medicineRouter.post('/interactions', async (req, res) => {
  try {
    const { newMedicine, currentMedicines, userProfile } = req.body;

    if (!newMedicine) {
      return res.status(400).json({ success: false, error: 'newMedicine is required' });
    }

    const userMessage = `New medicine: ${newMedicine}
Current medicines: ${(currentMedicines || []).join(', ') || 'None'}
Patient age: ${userProfile?.age || 'Unknown'}, conditions: ${userProfile?.chronicConditions?.join(', ') || 'None'}

Check for drug interactions and contraindications.`;

    const result = await askGroq(PROMPTS.DRUG_INTERACTION, userMessage, 0.1);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Medicine/Interactions]', error.message);
    res.status(500).json({ success: false, error: 'Interaction check failed.' });
  }
});
