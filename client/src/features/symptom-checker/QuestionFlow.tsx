// ═══════════════════════════════════════════════════════════════
// samaramAI — Adaptive AI Question Flow
// One question per screen. Groq AI integration.
// ChatGPT-style instant voice option matching & auto-navigation
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, HelpCircle, ArrowLeft } from 'lucide-react';
import { useSymptomStore } from '@/stores/symptomStore';
import { useVoiceStore } from '@/stores/voiceStore';
import { speechRecognizer } from '@/lib/voice/SpeechRecognition';
import { useTranslation } from '@/hooks/useTranslation';
import { slideFromRight } from '@/lib/animations';
import api from '@/lib/api';
import type { SymptomQuestion } from '@/types/symptom';

// Fallback questions if API unavailable
const FALLBACK_QUESTIONS: SymptomQuestion[] = [
  { question: 'When did this start?', options: ['Today', 'A few days ago', 'About a week ago', 'More than a week ago'], questionType: 'duration' },
  { question: 'How would you describe the sensation?', options: ['Sharp pain', 'Dull ache', 'Burning', 'Pressure or tightness'], questionType: 'quality' },
  { question: 'Does it come and go, or is it constant?', options: ['Comes and goes', 'Constant', 'Getting worse', 'Getting better'], questionType: 'pattern' },
  { question: 'Have you noticed any other symptoms?', options: ['Fever or chills', 'Nausea', 'Difficulty breathing', 'None of these'], questionType: 'associated' },
  { question: 'Have you taken anything for it?', options: ['Over-the-counter medicine', 'Home remedies', 'Prescription medicine', 'Nothing yet'], questionType: 'treatment' },
];

interface QuestionFlowProps {
  onComplete: () => void;
}

export default function QuestionFlow({ onComplete }: QuestionFlowProps) {
  const { selectedRegion, conversationHistory, addAnswer, setCurrentQuestion } = useSymptomStore();
  const { state: voiceState, transcript, interimTranscript, clearTranscript } = useVoiceStore();
  const { t } = useTranslation();
  const [question, setQuestion] = useState<SymptomQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [matchedOption, setMatchedOption] = useState<string | null>(null);
  const hasProcessedRef = useRef(false);

  // ── Register option matcher with the speech recognizer ──
  useEffect(() => {
    if (question && question.options.length > 0) {
      speechRecognizer.setOptionMatcher(question.options, (matched: string) => {
        // This fires instantly when speech matches an option
        if (!hasProcessedRef.current) {
          hasProcessedRef.current = true;
          setMatchedOption(matched);
          // Brief visual feedback, then advance
          setTimeout(() => {
            handleAnswer(matched);
            setMatchedOption(null);
          }, 300);
        }
      });
    }

    return () => {
      speechRecognizer.clearOptionMatcher();
    };
  }, [question]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reset processed flag when question changes ──
  useEffect(() => {
    hasProcessedRef.current = false;
    setMatchedOption(null);
  }, [questionIndex]);

  // ── Auto-start listening when a new question loads (if voice mode was active) ──
  useEffect(() => {
    if (question && !loading && voiceState === 'idle') {
      // Check if voice was recently used (within this flow)
      const wasVoiceActive = useVoiceStore.getState().isContinuousMode;
      if (wasVoiceActive) {
        setTimeout(() => {
          speechRecognizer.startListening();
        }, 200);
      }
    }
  }, [question, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNextQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.post('/symptom/question', {
        selectedRegion: selectedRegion?.id,
        conversationHistory,
      });
      const data = response.data.data;

      // Check if the Groq backend has signaled the interview should end
      if (data.isEmergency || data.isComplete) {
        onComplete();
        return;
      }

      const q = data as SymptomQuestion;
      setQuestion(q);
      setCurrentQuestion(q);
    } catch {
      // Use fallback questions
      if (questionIndex < FALLBACK_QUESTIONS.length) {
        setQuestion(FALLBACK_QUESTIONS[questionIndex]);
        setCurrentQuestion(FALLBACK_QUESTIONS[questionIndex]);
      } else {
        onComplete();
      }
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, conversationHistory, questionIndex, setCurrentQuestion, onComplete]);

  useEffect(() => {
    fetchNextQuestion();
  }, [questionIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback((answer: string) => {
    if (!question) return;

    // Stop listening before advancing
    speechRecognizer.stopListening();
    clearTranscript();

    addAnswer({ question: question.question, answer });

    // Let Groq decide when to stop. We add a safety cap of 8 questions to prevent endless loops.
    if (questionIndex >= 7) {
      onComplete();
    } else {
      setQuestionIndex((i) => i + 1);
    }
  }, [question, questionIndex, addAnswer, onComplete, clearTranscript]);

  // ── Show live voice transcript near the options for visual feedback ──
  const liveVoiceText = voiceState === 'listening'
    ? (interimTranscript ? (transcript ? `${transcript} ${interimTranscript}` : interimTranscript) : transcript)
    : '';

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ color: 'var(--color-teal-400)', fontSize: '1rem' }}
        >
          {t('symptom.thinking')}
        </motion.div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      {/* Step progress */}
      <div className="flex items-center gap-3" style={{ marginBottom: '2rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          background: 'rgba(13,148,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-teal-400)', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-display)',
        }}>
          {questionIndex + 1}
        </div>
        <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
          <div style={{ width: `${((questionIndex + 1) / 6) * 100}%`, height: '100%', background: 'var(--color-teal-500)', borderRadius: '2px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questionIndex}
          variants={slideFromRight}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
            fontWeight: 600,
            color: 'var(--color-text-inverse)',
            lineHeight: 1.35,
            marginBottom: '2rem',
          }}>
            {question.question}
          </h2>

          {/* Live voice transcript feedback */}
          {liveVoiceText && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginBottom: '1rem',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(13,148,136,0.08)',
                border: '1px solid rgba(13,148,136,0.2)',
                color: 'var(--color-teal-400)',
                fontSize: '0.9rem',
                fontStyle: 'italic',
              }}
            >
              🎙️ "{liveVoiceText}"
            </motion.div>
          )}

          {/* Answer options */}
          <div className="flex flex-col gap-3">
            {question.options.map((option) => {
              const isMatched = matchedOption === option;
              return (
                <motion.button
                  key={option}
                  whileHover={{ x: 6, background: 'rgba(13,148,136,0.12)', borderColor: 'var(--color-teal-500)' }}
                  whileTap={{ scale: 0.98 }}
                  animate={isMatched ? { 
                    background: 'rgba(13,148,136,0.25)', 
                    borderColor: 'var(--color-teal-400)',
                    scale: [1, 1.02, 1],
                  } : {}}
                  onClick={() => handleAnswer(option)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: isMatched ? '1.5px solid var(--color-teal-400)' : '1.5px solid rgba(255,255,255,0.1)',
                    background: isMatched ? 'rgba(13,148,136,0.2)' : 'rgba(255,255,255,0.03)',
                    color: 'var(--color-text-inverse)',
                    fontSize: '1.05rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    minHeight: '64px',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s',
                  }}
                >
                  {isMatched && <span style={{ marginRight: '0.5rem' }}>✓</span>}
                  {option}
                </motion.button>
              );
            })}
          </div>

          {/* Bottom controls */}
          <div className="flex items-center justify-between" style={{ marginTop: '2rem' }}>
            <button
              onClick={() => {
                if (questionIndex > 0) setQuestionIndex((i) => i - 1);
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.9rem', opacity: questionIndex > 0 ? 1 : 0.3,
              }}
              disabled={questionIndex === 0}
            >
              <ArrowLeft size={16} /> {t('symptom.back')}
            </button>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  if (voiceState === 'listening' || voiceState === 'processing') {
                    speechRecognizer.stopListening();
                  } else if (voiceState !== 'ai_speaking') {
                    speechRecognizer.startListening();
                  }
                }}
                style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.15)', 
                background: voiceState === 'listening' ? 'rgba(239,68,64,0.2)' : 'none',
                color: voiceState === 'listening' ? '#EF4444' : 'var(--color-teal-400)', 
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Mic size={20} />
              </button>
              <button style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.1)', background: 'none',
                color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <HelpCircle size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
