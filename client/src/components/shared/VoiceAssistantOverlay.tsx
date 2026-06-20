// ═══════════════════════════════════════════════════════════════
// samaramAI — Global Voice Assistant Overlay
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Settings, X, Loader2, Volume2, VolumeX } from 'lucide-react';
import { useVoiceStore } from '@/stores/voiceStore';
import { speechRecognizer } from '@/lib/voice/SpeechRecognition';
import { speechSynthesizer } from '@/lib/voice/SpeechSynthesis';
import { useTranslation } from '@/hooks/useTranslation';
import VoiceSettingsModal from './VoiceSettingsModal';

export default function VoiceAssistantOverlay() {
  const { state, errorMessage, isContinuousMode, isMuted, setPreferences, clearTranscript } = useVoiceStore();
  const { t, language } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync language changes with the recognizer
  useEffect(() => {
    speechRecognizer.setLanguage(language);
  }, [language]);

  const toggleListening = () => {
    if (state === 'listening' || state === 'processing') {
      speechRecognizer.stopListening();
    } else if (state === 'speaking' || state === 'ai_speaking') {
      speechSynthesizer.cancel();
    } else if (state !== 'submitted') {
      speechRecognizer.startListening();
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'listening': return `🎙️ ${t('voice.listening')}`;
      case 'processing': return `⚙️ ${t('voice.processing')}`;
      case 'submitted': return `📤 ${t('voice.sending')}`;
      case 'speaking': return `🔊 ${t('voice.speaking')}`;
      case 'ai_speaking': return `🔊 ${t('voice.speaking')}`;
      case 'error': return t('voice.error');
      default: return t('voice.assistant');
    }
  };

  // Only show the overlay when active or in continuous mode
  const isVisible = state !== 'idle' || isContinuousMode || errorMessage;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '1rem',
            }}
          >
            {/* Main Control Pill */}
            <div className="glass-dark" style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: 'white',
              boxShadow: state === 'listening' ? 'var(--shadow-glow-teal)' : 'var(--shadow-glass)',
              border: `1px solid ${state === 'error' ? 'var(--color-emergency)' : 'rgba(255,255,255,0.1)'}`,
            }}>
              {/* Status Icon */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {state === 'listening' && (
                  <>
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} 
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: 'var(--color-teal-400)', zIndex: -1 }} 
                    />
                    <Mic size={20} color="var(--color-teal-400)" />
                  </>
                )}
                {state === 'processing' && <Loader2 size={20} className="animate-spin" color="var(--color-blue-400)" />}
                {(state === 'speaking' || state === 'ai_speaking') && <Volume2 size={20} color="var(--color-teal-400)" />}
                {state === 'submitted' && <Loader2 size={20} className="animate-spin" color="var(--color-teal-300)" />}
                {state === 'error' && <X size={20} color="var(--color-emergency)" />}
                {state === 'idle' && <MicOff size={20} color="rgba(255,255,255,0.5)" />}
              </div>

              {/* Status Text */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{getStatusText()}</span>
                {errorMessage && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-emergency)' }}>{errorMessage}</span>
                )}
              </div>

              <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)' }} />

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleListening}
                  style={{
                    background: state === 'listening' ? 'rgba(239,68,64,0.2)' : 'var(--color-teal-500)',
                    color: state === 'listening' ? '#EF4444' : 'white',
                    border: 'none',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {state === 'listening' ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Settings size={16} />
                </button>
                
                {state === 'error' && (
                  <button 
                    onClick={() => useVoiceStore.getState().reset()}
                    style={{
                      background: 'none',
                      color: 'rgba(255,255,255,0.5)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Wake word hint */}
            {isContinuousMode && state === 'idle' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                Say "Hello Samaram" to wake
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <VoiceSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
