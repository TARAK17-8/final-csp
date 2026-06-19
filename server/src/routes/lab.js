// ═══════════════════════════════════════════════════════════════
// samaramAI — Lab Value Analysis Routes (Groq AI)
// Patient-context-aware lab result interpretation
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import { askGroq, PROMPTS } from '../services/groqService.js';

export const labRouter = Router();

// POST /api/health-records/analyze-lab — Analyze a lab result
labRouter.post('/analyze-lab', async (req, res) => {
  try {
    const { testName, value, unit, userProfile } = req.body;

    if (!testName || value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        error: 'testName and value are required.',
      });
    }

    const userMessage = `Lab test: ${testName}
Value: ${value} ${unit || ''}
Patient: ${userProfile?.age || 'Unknown'} year old ${userProfile?.gender || 'unknown gender'}
Conditions: ${userProfile?.chronicConditions?.join(', ') || 'None'}
Medications: ${userProfile?.medications?.join(', ') || 'None'}

Analyze this lab result in the context of this specific patient.
Use Indian reference ranges where applicable.`;

    const result = await askGroq(PROMPTS.LAB_VALUE_ANALYSIS, userMessage, 0.1);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Lab/Analyze]', error.message);
    res.status(500).json({
      success: false,
      error: 'Lab analysis failed. Please try again.',
    });
  }
});
