// ═══════════════════════════════════════════════════════════════
// samaramAI — Voice Transcription Route
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { speechService } from '../services/speechService.js';

export const voiceTranscriptionRouter = Router();

// Configure multer to save temporarily to OS temp directory
const upload = multer({ 
  dest: os.tmpdir(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/voice/transcribe
voiceTranscriptionRouter.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No audio file provided' });
    }

    const { language } = req.body;
    const filePath = req.file.path;
    
    // Add extension so Whisper can detect format if needed
    const fileWithExt = `${filePath}.webm`;
    import('fs').then(fs => fs.renameSync(filePath, fileWithExt));

    const transcribedText = await speechService.transcribe(fileWithExt, language);
    
    res.json({ success: true, data: { text: transcribedText } });
  } catch (error) {
    console.error('[Voice/Transcribe] Error:', error.message);
    res.status(500).json({ success: false, error: 'Transcription failed' });
  }
});
