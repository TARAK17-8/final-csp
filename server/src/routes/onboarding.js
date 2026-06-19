// ═══════════════════════════════════════════════════════════════
// samaramAI — Onboarding Routes
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';

export const onboardingRouter = Router();

// POST /api/onboarding — Save onboarding data
onboardingRouter.post('/', async (req, res) => {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.age || !data.biologicalSex || !data.preferredLanguage) {
      return res.status(400).json({
        success: false,
        error: 'age, biologicalSex, and preferredLanguage are required',
      });
    }

    // In production, save to Firestore via Firebase Admin
    // For now, acknowledge receipt
    console.log('Onboarding data received:', JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: 'Onboarding complete',
      data: { isOnboarded: true },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ success: false, error: 'Failed to save onboarding data.' });
  }
});
