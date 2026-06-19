// ═══════════════════════════════════════════════════════════════
// samaramAI — Emergency Routes (Groq AI Intelligence)
// No more rule-based pattern matching. Groq AI decides.
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import { askGroq, PROMPTS } from '../services/groqService.js';

export const emergencyRouter = Router();

// POST /api/emergency/check — Grok AI emergency assessment
emergencyRouter.post('/check', async (req, res) => {
  try {
    const { selectedRegion, conversationHistory, severity, userProfile } = req.body;

    const userMessage = `Patient profile:
- Age: ${userProfile?.age || 'Unknown'}
- Gender: ${userProfile?.gender || 'Unknown'}
- Chronic Conditions: ${userProfile?.chronicConditions?.join(', ') || 'None'}
- Current Medications: ${userProfile?.medications?.join(', ') || 'None'}

Body Region: ${selectedRegion || 'Not specified'}
Self-reported Severity: ${severity || 'Not specified'}

Symptom Conversation:
${(conversationHistory || []).map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n') || '(No conversation yet)'}

Analyze if this is a medical emergency.`;

    const result = await askGroq(PROMPTS.EMERGENCY_AND_ANALYSIS, userMessage, 0.1);

    res.json({
      success: true,
      data: {
        isEmergency: result.isEmergency || false,
        elevatedRisk: result.urgencyLevel === 'high' || result.urgencyLevel === 'emergency',
        emergencyType: result.emergencyType || null,
        emergencyInstructions: result.emergencyInstructions || null,
        confidence: result.confidence || 0,
        urgencyLevel: result.urgencyLevel || 'low',
        message: result.isEmergency
          ? `Emergency detected: ${result.emergencyType || 'Critical symptoms identified'}`
          : null,
      },
    });
  } catch (error) {
    console.error('[Emergency/Check]', error.message);
    res.status(500).json({
      success: false,
      error: 'Emergency check failed. If you feel this is an emergency, call 108 immediately.',
    });
  }
});
