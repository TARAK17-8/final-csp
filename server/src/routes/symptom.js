// ═══════════════════════════════════════════════════════════════
// samaramAI — Symptom Routes (Groq AI Intelligence)
// NO rule engines. Every decision is Groq AI.
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import { askGroq, PROMPTS } from '../services/groqService.js';

export const symptomRouter = Router();

// ────────────────────────────────────────────────────────────
// POST /api/symptom/question — Grok AI generates next question
// ────────────────────────────────────────────────────────────
symptomRouter.post('/question', async (req, res) => {
  try {
    const { selectedRegion, conversationHistory, userProfile } = req.body;

    if (!selectedRegion) {
      return res.status(400).json({ success: false, error: 'selectedRegion is required' });
    }

    const userMessage = `Body region: ${selectedRegion}
Patient: ${userProfile?.age || 'Unknown'} year old ${userProfile?.gender || 'unknown gender'}, conditions: ${userProfile?.chronicConditions?.join(', ') || 'None reported'}
Conversation so far:
${(conversationHistory || []).map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n') || '(No questions asked yet — this is the first question)'}

Generate the next follow-up question.`;

    const result = await askGroq(PROMPTS.ADAPTIVE_QUESTION, userMessage, 0.3);

    // If Grok detected an emergency during questioning
    if (result.isEmergency) {
      return res.json({
        success: true,
        data: {
          isEmergency: true,
          pattern: 'Grok AI detected emergency pattern during symptom interview',
        },
      });
    }

    // If Grok says enough questions have been asked
    if (result.isComplete) {
      return res.json({
        success: true,
        data: {
          isComplete: true,
          question: result.question,
          options: result.options,
        },
      });
    }

    res.json({
      success: true,
      data: {
        question: result.question,
        options: result.options,
        questionType: result.questionContext || 'adaptive',
      },
    });
  } catch (error) {
    console.error('[Symptom/Question]', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate question. Please try again.',
    });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/symptom/analyze — Grok AI does EVERYTHING:
// emergency detection + condition analysis + urgency + next steps
// ────────────────────────────────────────────────────────────
symptomRouter.post('/analyze', async (req, res) => {
  try {
    const { selectedRegion, conversationHistory, severity, userProfile } = req.body;

    if (!selectedRegion || !conversationHistory || !severity) {
      return res.status(400).json({
        success: false,
        error: 'selectedRegion, conversationHistory, and severity are required',
      });
    }

    const userMessage = `Patient profile:
- Age: ${userProfile?.age || 'Unknown'}
- Gender: ${userProfile?.gender || 'Unknown'}
- Chronic Conditions: ${userProfile?.chronicConditions?.join(', ') || 'None'}
- Current Medications: ${userProfile?.medications?.join(', ') || 'None'}
- Allergies: ${userProfile?.allergies?.join(', ') || 'None'}

Body Region: ${selectedRegion}
Self-reported Severity: ${severity}

Full Symptom Conversation:
${conversationHistory.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Analyze these symptoms. Determine if this is an emergency, identify likely conditions, and provide next steps.`;

    const analysis = await askGroq(PROMPTS.EMERGENCY_AND_ANALYSIS, userMessage, 0.2);

    // Normalize the response to match what the frontend expects
    const normalizedAnalysis = {
      isEmergency: analysis.isEmergency || false,
      lowConfidence: analysis.lowConfidence || false,
      conditions: (analysis.conditions || []).map((c) => ({
        name: c.name,
        plainName: c.plainName,
        confidence: c.confidence,
        description: c.description,
      })),
      urgencyLevel: analysis.urgencyLevel === 'emergency' ? 'high' : (analysis.urgencyLevel || 'low'),
      nextSteps: analysis.nextSteps || [],
      disclaimer: analysis.disclaimer || 'This is an AI-generated health assessment and not a medical diagnosis. Always consult a qualified healthcare professional.',
    };

    // If emergency, add emergency-specific fields
    if (analysis.isEmergency) {
      normalizedAnalysis.emergencyType = analysis.emergencyType;
      normalizedAnalysis.emergencyInstructions = analysis.emergencyInstructions;
    }

    res.json({ success: true, data: normalizedAnalysis });
  } catch (error) {
    console.error('[Symptom/Analyze]', error.message);
    res.status(500).json({
      success: false,
      error: 'Analysis failed. Please try again.',
    });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/symptom/validate — Grok AI contradiction detection
// ────────────────────────────────────────────────────────────
symptomRouter.post('/validate', async (req, res) => {
  try {
    const { conversationHistory } = req.body;

    if (!conversationHistory || conversationHistory.length < 2) {
      return res.json({
        success: true,
        data: { hasContradiction: false },
      });
    }

    const userMessage = `Review this medical symptom conversation for contradictions:

${conversationHistory.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Check for logical inconsistencies in the patient's answers.`;

    const result = await askGroq(PROMPTS.CONTRADICTION_DETECTION, userMessage, 0.2);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Symptom/Validate]', error.message);
    res.status(500).json({
      success: false,
      error: 'Validation failed.',
    });
  }
});
