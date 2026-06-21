// ═══════════════════════════════════════════════════════════════
// samaramAI — Express Server (Groq AI Intelligence Layer)
// Every backend decision flows through Groq AI.
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Route imports
import { symptomRouter } from './routes/symptom.js';
import { medicineRouter } from './routes/medicine.js';
import { onboardingRouter } from './routes/onboarding.js';
import { emergencyRouter } from './routes/emergency.js';
import { prescriptionRouter } from './routes/prescription.js';
import { factcheckRouter } from './routes/factcheck.js';
import { voiceRouter } from './routes/voice.js';
import { labRouter } from './routes/lab.js';
import { chatRouter } from './routes/chat.js';
import { prescriptionTranslatorRouter } from './routes/prescriptionTranslator.js';
import { translateRouter } from './routes/translate.js';
import { voiceTranscriptionRouter } from './routes/voiceTranscription.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security ──
// Helmet configured for cross-origin API server:
// - CSP disabled (not needed for API-only server)
// - crossOriginResourcePolicy set to cross-origin (required for cross-origin fetch)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
const allowedOrigins = [process.env.CLIENT_URL, 'https://samaramai.web.app', 'https://samaramai.netlify.app', 'https://smaramai.netlify.app', 'http://localhost:5173'].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-target-language-name'],
}));

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

import { requestContext } from './services/groqService.js';

// ── Body Parsing & Context ──
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  const langName = req.header('x-target-language-name');
  requestContext.run({ targetLanguageName: langName }, () => {
    next();
  });
});

// ── Health Check ──
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    intelligence: `Groq AI (${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'})`,
    endpoints: [
      'POST /api/symptom/question',
      'POST /api/symptom/analyze',
      'POST /api/symptom/validate',
      'POST /api/medicine/scan',
      'POST /api/medicine/lookup',
      'POST /api/medicine/interactions',
      'POST /api/prescription/translate',
      'POST /api/prescription-translator/translate',
      'POST /api/factcheck',
      'POST /api/chat',
      'POST /api/voice/map',
      'POST /api/voice/transcribe',
      'POST /api/health-records/analyze-lab',
      'POST /api/emergency/check',
      'POST /api/onboarding',
    ],
  });
});

// ── Routes ──
app.use('/api/symptom', symptomRouter);
app.use('/api/medicine', medicineRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/emergency', emergencyRouter);
app.use('/api/prescription', prescriptionRouter);
app.use('/api/factcheck', factcheckRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/voice', voiceTranscriptionRouter);
app.use('/api/health-records', labRouter);
app.use('/api/chat', chatRouter);
app.use('/api/prescription-translator', prescriptionTranslatorRouter);
app.use('/api/translate', translateRouter);


// ── Global Error Handler ──
app.use((err, _req, res, _next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Start Server / Export Function ──
import { onRequest } from "firebase-functions/v2/https";
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

console.log(`
╔══════════════════════════════════════════════════╗
║  samaramAI API Server v2.1                      ║
║  Intelligence: Groq AI (${MODEL})    ║
║  Mode: Firebase Cloud Functions                 ║
╚══════════════════════════════════════════════════╝
`);

export const api = onRequest({ region: 'us-central1' }, app);

// ── Render / Local Express Server Start ──
// If PORT is defined (e.g. on Render) or not in production, start listening.
// This prevents the Node process from exiting immediately when deployed to Render.
if (process.env.NODE_ENV !== 'production' || process.env.PORT || process.env.RENDER) {
  app.listen(PORT, () => {
    console.log(`Express server actively listening on port ${PORT}`);
  });
}
