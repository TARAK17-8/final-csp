// ═══════════════════════════════════════════════════════════════
// samaramAI — Health Fact Checker Routes (Groq AI)
// Fights WhatsApp health misinformation
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import { askGroq, PROMPTS } from '../services/groqService.js';

export const factcheckRouter = Router();

// POST /api/factcheck — Check a health claim
factcheckRouter.post('/', async (req, res) => {
  try {
    const { claim } = req.body;

    if (!claim || claim.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a health claim to check (at least 5 characters).',
      });
    }

    const userMessage = `Health claim to fact-check: "${claim}"

Analyze this claim and determine if it is verified, misleading, or partially true.
Ground your analysis in WHO, ICMR, and established medical consensus.`;

    const result = await askGroq(PROMPTS.FACT_CHECK, userMessage, 0.2);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[FactCheck]', error.message);
    res.status(500).json({
      success: false,
      error: 'Fact check failed. Please try again.',
    });
  }
});
