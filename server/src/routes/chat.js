// ═══════════════════════════════════════════════════════════════
// samaramAI — AI Health Chat Routes (Groq AI)
// General-purpose health assistant with conversation memory
// ═══════════════════════════════════════════════════════════════

import { Router } from 'express';
import { chatGroq, PROMPTS } from '../services/groqService.js';
import { voiceSessionService } from '../services/voiceSession.js';

export const chatRouter = Router();

// POST /api/chat — General health chat
chatRouter.post('/', async (req, res) => {
  try {
    const { message, conversationHistory, hospitalContext, isVoiceInteraction } = req.body;

    if (!message || message.trim().length < 1) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message.',
      });
    }

    // Build the system prompt, optionally enriched with hospital data
    let systemPrompt = PROMPTS.HEALTH_CHAT;
    if (hospitalContext) {
      systemPrompt += `\n\nNEARBY HOSPITAL DATA (from user's real GPS location):\n${hospitalContext}\n\nUse this data to answer hospital-related questions accurately. Reference specific hospital names, distances, phone numbers, emergency availability, and specialties from this data. If the user asks about hospitals, always use this real data instead of generic advice.`;
    }

    if (isVoiceInteraction) {
      systemPrompt = voiceSessionService.getVoiceOptimizedPrompt(systemPrompt);
    }

    // Build messages array from conversation history
    const messages = [];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    // Add the current message
    messages.push({ role: 'user', content: message });

    const reply = await chatGroq(systemPrompt, messages, 0.4);

    res.json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (error) {
    console.error('[Chat]', error.message);
    res.status(500).json({
      success: false,
      error: 'Chat failed. Please try again.',
    });
  }
});
