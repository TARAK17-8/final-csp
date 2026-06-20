// ═══════════════════════════════════════════════════════════════
// samaramAI — AI Assistant (Chat Interface)
// ChatGPT-style real-time voice chat
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Mic, Bot, User, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import { useVoiceStore } from '@/stores/voiceStore';
import { speechSynthesizer } from '@/lib/voice/SpeechSynthesis';
import { speechRecognizer } from '@/lib/voice/SpeechRecognition';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { transcript, interimTranscript, state: voiceState, isContinuousMode, clearTranscript } = useVoiceStore();
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: 'Namaste! 🙏 I\'m your samaramAI health assistant. You can ask me anything about your health — symptoms, medicines, diet, or general wellness questions.\n\nHow can I help you today?', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);

  // ── Real-time transcript → input binding ──
  // Show live words as the user speaks (ChatGPT-style)
  useEffect(() => {
    if (voiceState === 'listening') {
      // Combine finalized transcript + live interim for instant display
      const liveText = interimTranscript 
        ? (transcript ? `${transcript} ${interimTranscript}` : interimTranscript)
        : transcript;
      if (liveText) {
        setInput(liveText);
      }
    }
  }, [transcript, interimTranscript, voiceState]);

  // ── Auto-submit when voice state transitions to 'submitted' ──
  useEffect(() => {
    if (voiceState === 'submitted' && transcript.trim() && !isSubmittingRef.current) {
      setInput(transcript.trim());
      // Use a micro-delay to let React render the final text in the input
      requestAnimationFrame(() => {
        sendMessage(true);
      });
    }
  }, [voiceState]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Register auto-submit callback with the recognizer ──
  useEffect(() => {
    speechRecognizer.setOnAutoSubmit((finalText: string) => {
      // The voiceStore state change to 'submitted' will trigger the useEffect above
      // This callback is a hook point for additional logic if needed
    });

    return () => {
      speechRecognizer.setOnAutoSubmit(null);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (isVoice = false) => {
    const currentInput = useVoiceStore.getState().transcript || input;
    if (!currentInput.trim() || loading || isSubmittingRef.current) return;

    isSubmittingRef.current = true;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: currentInput.trim(), timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    clearTranscript();
    setLoading(true);

    // Stop listening during API call if active
    if (voiceState === 'listening') {
      speechRecognizer.stopListening();
    }

    try {
      // Build conversation history for context (exclude the initial greeting)
      const conversationHistory = updatedMessages
        .filter((m) => m.id !== '0')
        .map((m) => ({ role: m.role, content: m.content }));

      // Include nearby hospital data if available (cached by NearbyHospitalsPage)
      let hospitalContext: string | undefined;
      try {
        const raw = localStorage.getItem('samaramai_hospital_data');
        if (raw) {
          const parsed = JSON.parse(raw);
          // Only use if data is less than 30 minutes old
          if (parsed.fetchedAt && Date.now() - parsed.fetchedAt < 30 * 60 * 1000) {
            hospitalContext = JSON.stringify(parsed.hospitals);
          }
        }
      } catch {
        // localStorage unavailable or data corrupted
      }

      const response = await api.post('/chat', {
        message: userMsg.content,
        conversationHistory: conversationHistory.slice(0, -1), // exclude current message, it's sent separately
        isVoiceInteraction: isVoice || isContinuousMode,
        ...(hospitalContext ? { hospitalContext } : {}),
      });

      const reply = response.data.data.reply;

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }]);
      
      // Speak the reply if voice interaction
      if (isVoice || isContinuousMode) {
        speechSynthesizer.speak(reply, language);
      }
      
    } catch {
      const errorReply = 'I\'m having trouble connecting right now. Please check your internet connection and try again.\n\nIn the meantime, you can try these features:\n• **Symptom Checker** — Describe your symptoms for AI analysis\n• **Medicine Scanner** — Scan a medicine strip for instant info\n• **Emergency Care** — Quick access to 108 and first aid guides';
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorReply,
        timestamp: new Date(),
      }]);
      
      if (isVoice || isContinuousMode) {
        speechSynthesizer.speak("I'm having trouble connecting right now. Please check your internet connection.", language);
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  }, [input, messages, loading, voiceState, isContinuousMode, language, clearTranscript]);

  // Simple markdown-ish rendering: **bold**, bullet points
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // ── Voice state label for UX feedback ──
  const getVoiceStatusLabel = () => {
    switch (voiceState) {
      case 'listening': return `🎙️ ${t('voice.listening')}`;
      case 'processing': return `⚙️ ${t('voice.processing')}`;
      case 'submitted': return `📤 ${t('voice.sending')}`;
      case 'ai_speaking': return `🔊 ${t('voice.speaking')}`;
      default: return null;
    }
  };

  const voiceStatusLabel = getVoiceStatusLabel();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-midnight)', color: 'var(--color-text-inverse)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex items-center gap-3" style={{ padding: '1rem clamp(1.5rem, 5vw, 4rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}><ArrowLeft size={18} /></button>
        <div className="flex items-center gap-2">
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-400))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem' }}>{t('assistant.title')}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(1rem, 3vw, 2rem) clamp(1.5rem, 5vw, 4rem)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: msg.role === 'assistant' ? 'rgba(13,148,136,0.15)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {msg.role === 'assistant' ? <Bot size={16} color="var(--color-teal-400)" /> : <User size={16} color="rgba(255,255,255,0.5)" />}
                </div>
                <div style={{ maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', background: msg.role === 'user' ? 'var(--color-teal-500)' : 'rgba(255,255,255,0.06)', color: 'var(--color-text-inverse)', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {renderContent(msg.content)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex items-center gap-2" style={{ padding: '0.5rem 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>{t('common.loading')}</motion.div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Voice status indicator */}
      {voiceStatusLabel && (
        <div style={{ textAlign: 'center', padding: '0.3rem 0', fontSize: '0.8rem', color: 'var(--color-teal-400)', letterSpacing: '0.02em' }}>
          <motion.span
            animate={voiceState === 'listening' ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
            transition={voiceState === 'listening' ? { duration: 1.2, repeat: Infinity } : {}}
          >
            {voiceStatusLabel}
          </motion.span>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '1rem clamp(1.5rem, 5vw, 4rem)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex gap-2" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <button 
            onClick={() => {
              if (voiceState === 'listening' || voiceState === 'processing') {
                speechRecognizer.stopListening();
              } else if (voiceState !== 'ai_speaking' && voiceState !== 'submitted') {
                speechRecognizer.startListening();
              }
            }}
            style={{ 
              width: 48, height: 48, borderRadius: '50%', 
              border: '1.5px solid rgba(255,255,255,0.1)', 
              background: voiceState === 'listening' ? 'rgba(239,68,64,0.2)' : 'none', 
              color: voiceState === 'listening' ? '#EF4444' : 'var(--color-teal-400)', 
              cursor: voiceState === 'ai_speaking' ? 'not-allowed' : 'pointer', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: voiceState === 'ai_speaking' ? 0.4 : 1,
              transition: 'all 0.2s',
            }}
            disabled={voiceState === 'ai_speaking'}
          >
            <Mic size={20} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={t('assistant.placeholder')}
            className="input-field"
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1.5px solid rgba(255,255,255,0.1)', minHeight: '48px' }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim()} className="btn-primary" style={{ width: 48, minHeight: 48, padding: 0 }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
