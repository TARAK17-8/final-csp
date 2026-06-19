// ═══════════════════════════════════════════════════════════════
// samaramAI — Voice Settings Modal
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, FastForward, Play, Settings2 } from 'lucide-react';
import { useVoiceStore } from '@/stores/voiceStore';
import { useTranslation } from '@/hooks/useTranslation';
import { speechSynthesizer } from '@/lib/voice/SpeechSynthesis';
import { useEffect, useState } from 'react';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceSettingsModal({ isOpen, onClose }: VoiceSettingsModalProps) {
  const { t, language } = useTranslation();
  const { isMuted, speed, isContinuousMode, setPreferences } = useVoiceStore();
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAvailableVoices(speechSynthesizer.getVoicesForLanguage(language));
    }
  }, [isOpen, language]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
          }}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="glass-dark"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '480px',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            color: 'var(--color-text-inverse)',
            boxShadow: 'var(--shadow-card-hover)',
          }}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
            <h2 className="flex items-center gap-2 text-display-sm" style={{ margin: 0 }}>
              <Settings2 size={24} color="var(--color-teal-400)" />
              Voice Settings
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Mute Toggle */}
            <div className="flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Assistant Voice</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Mute the assistant's spoken responses</p>
              </div>
              <button
                onClick={() => setPreferences({ isMuted: !isMuted })}
                style={{
                  background: isMuted ? 'rgba(239,68,64,0.2)' : 'rgba(13,148,136,0.2)',
                  color: isMuted ? '#EF4444' : 'var(--color-teal-400)',
                  border: `1px solid ${isMuted ? 'rgba(239,68,64,0.5)' : 'rgba(13,148,136,0.5)'}`,
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600
                }}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {isMuted ? 'Muted' : 'Unmuted'}
              </button>
            </div>

            {/* Continuous Mode Toggle */}
            <div className="flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Continuous Conversation</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Keep listening after responding</p>
              </div>
              <button
                onClick={() => setPreferences({ isContinuousMode: !isContinuousMode })}
                style={{
                  background: isContinuousMode ? 'var(--color-teal-500)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {isContinuousMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Speed Control */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <h4 className="flex items-center gap-2" style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  <FastForward size={16} color="var(--color-teal-400)" />
                  Speech Speed
                </h4>
                <span style={{ fontWeight: 600, color: 'var(--color-teal-400)' }}>{speed}x</span>
              </div>
              <div className="flex gap-2">
                {[0.5, 1, 1.25, 1.5, 2].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPreferences({ speed: val })}
                    style={{
                      flex: 1,
                      background: speed === val ? 'var(--color-teal-500)' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 0',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {val}x
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selection (if supported by OS/Browser) */}
            {availableVoices.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ margin: 0, marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Voice Selection</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {availableVoices.slice(0, 3).map((voice) => (
                    <button
                      key={voice.voiceURI}
                      onClick={() => setPreferences({ voiceURI: voice.voiceURI })}
                      className="flex justify-between items-center"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        color: 'white',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {voice.name}
                      </span>
                      <Play size={14} color="var(--color-teal-400)" onClick={(e) => {
                        e.stopPropagation();
                        // Test voice
                        const u = new SpeechSynthesisUtterance('Namaste, how can I help you?');
                        u.voice = voice;
                        window.speechSynthesis.speak(u);
                      }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
