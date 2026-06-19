// ═══════════════════════════════════════════════════════════════
// samaramAI — Voice Session Management
// ═══════════════════════════════════════════════════════════════

/**
 * Provides conversational context management specific to voice interactions.
 * Voice responses must be more concise and avoid heavy markdown compared to text chat.
 */
export const voiceSessionService = {
  /**
   * Modifies a system prompt to enforce voice-friendly output
   * @param {string} baseSystemPrompt - The original system prompt
   * @returns {string} The modified system prompt
   */
  getVoiceOptimizedPrompt(baseSystemPrompt) {
    return baseSystemPrompt + `
    
CRITICAL VOICE CONVERSATION RULES:
- You are speaking out loud to the user.
- Keep responses CONCISE (1-3 short sentences max).
- DO NOT use markdown, bullet points, asterisks, or complex formatting.
- Speak naturally and conversationally.
- Do not repeat the user's question.
- Do not output code blocks or URLs.`;
  }
};
