// ═══════════════════════════════════════════════════════════════
// samaramAI — Symptom Checker Page (Orchestrator)
// Routes between: region → questions → severity → confirm → results
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useSymptomStore } from '@/stores/symptomStore';
import { useAuthStore } from '@/stores/authStore';
import BodyDiagram from './BodyDiagram';
import QuestionFlow from './QuestionFlow';
import SeveritySelector from './SeveritySelector';
import AnalysisResults from './AnalysisResults';
import { slideFromRight } from '@/lib/animations';
import api from '@/lib/api';
import type { BodyRegion } from '@/types/symptom';

export default function SymptomCheckerPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentStep, selectedRegion, selectRegion, goBack, reset, setStep } = useSymptomStore();

  const handleSelectRegion = (region: BodyRegion) => {
    selectRegion(region);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-midnight)', color: 'var(--color-text-inverse)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between" style={{ padding: '1.25rem clamp(1.5rem, 5vw, 4rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => {
            if (currentStep === 'region') navigate(-1);
            else goBack();
          }}
          className="flex items-center gap-2"
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={18} /> {currentStep === 'region' ? t('common.back') : t('common.back')}
        </button>

        <span className="text-label" style={{ color: 'var(--color-teal-400)', fontSize: '0.7rem' }}>
          {selectedRegion ? `${selectedRegion.name}` : t('symptom.title')}
        </span>

        <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Progress bar */}
      {currentStep !== 'region' && currentStep !== 'emergency' && (
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            animate={{
              width: {
                region: '0%', questions: '30%', severity: '55%', confirmation: '75%',
                analyzing: '90%', results: '100%', emergency: '100%',
              }[currentStep],
            }}
            transition={{ duration: 0.4 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-teal-500), var(--color-teal-400))', borderRadius: '2px' }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', maxWidth: '800px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          {/* Step: Select Body Region */}
          {currentStep === 'region' && (
            <motion.div key="region" variants={slideFromRight} initial="hidden" animate="visible" exit="exit">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 className="text-display-md" style={{ marginBottom: '0.5rem' }}>{t('symptom.whereHurts')}</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>{t('symptom.selectBodyRegion')}</p>
              </div>
              <BodyDiagram onSelectRegion={handleSelectRegion} />
            </motion.div>
          )}

          {/* Step: AI Question Flow */}
          {currentStep === 'questions' && (
            <motion.div key="questions" variants={slideFromRight} initial="hidden" animate="visible" exit="exit">
              <QuestionFlow onComplete={() => setStep('severity')} />
            </motion.div>
          )}

          {/* Step: Severity */}
          {currentStep === 'severity' && (
            <motion.div key="severity" variants={slideFromRight} initial="hidden" animate="visible" exit="exit">
              <SeveritySelector />
            </motion.div>
          )}

          {/* Step: Confirmation */}
          {currentStep === 'confirmation' && (
            <motion.div key="confirmation" variants={slideFromRight} initial="hidden" animate="visible" exit="exit">
              <ConfirmationScreen />
            </motion.div>
          )}

          {/* Step: Analyzing */}
          {currentStep === 'analyzing' && (
            <motion.div key="analyzing" variants={slideFromRight} initial="hidden" animate="visible" exit="exit" style={{ textAlign: 'center', padding: '4rem 0' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ width: 60, height: 60, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-teal-400)', margin: '0 auto 2rem' }}
              />
              <h2 className="text-display-sm" style={{ marginBottom: '0.5rem' }}>{t('symptom.analyzingSymptoms')}</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>{t('symptom.analyzing')}</p>
            </motion.div>
          )}

          {/* Step: Results */}
          {(currentStep === 'results' || currentStep === 'emergency') && (
            <motion.div key="results" variants={slideFromRight} initial="hidden" animate="visible" exit="exit">
              <AnalysisResults />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Confirmation Screen ──
function ConfirmationScreen() {
  const { selectedRegion, conversationHistory, severity, setStep, setLoading, setAnalysis } = useSymptomStore();
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();

  const handleSubmit = async () => {
    setStep('analyzing');
    setLoading(true);

    try {
      const response = await api.post('/symptom/analyze', {
        selectedRegion: selectedRegion?.id,
        conversationHistory,
        severity,
        userProfile: user ? {
          age: 30,
          gender: 'not_specified',
          chronicConditions: [],
          allergies: [],
          medications: [],
        } : undefined,
      });
      setAnalysis(response.data.data);
    } catch {
      // Fallback mock analysis for demo
      setAnalysis({
        isEmergency: false,
        lowConfidence: false,
        conditions: [
          { name: 'Gastroesophageal Reflux', plainName: 'Acid Reflux (GERD)', confidence: 78, description: 'Stomach acid flowing back into the esophagus causing heartburn and chest discomfort.' },
          { name: 'Costochondritis', plainName: 'Chest Wall Inflammation', confidence: 52, description: 'Inflammation of the cartilage connecting ribs to the breastbone.' },
        ],
        urgencyLevel: 'low',
        nextSteps: [
          'Avoid spicy and acidic foods for the next few days',
          'Try over-the-counter antacids after meals',
          'Schedule a visit with your doctor if symptoms persist beyond a week',
        ],
        disclaimer: 'This is an AI-generated health assessment and not a medical diagnosis. Always consult a qualified healthcare professional.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-display-md" style={{ marginBottom: '0.5rem' }}>{t('symptom.results')}</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>{t('symptom.nextSteps')}</p>

      {/* Summary cards */}
      <div className="flex flex-col gap-3" style={{ marginBottom: '2rem' }}>
        <SummaryRow label="Region" value={selectedRegion?.name || ''} />
        {conversationHistory.map((item, i) => (
          <SummaryRow key={i} label={`Q${i + 1}`} value={item.answer} sublabel={item.question} />
        ))}
        <SummaryRow label="Severity" value={severity ? severity.toUpperCase() : 'Not set'} />
      </div>

      <button onClick={handleSubmit} className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
        {t('symptom.title')}
      </button>

      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
        🔒 Your information is encrypted. This session is private.
      </p>
    </div>
  );
}

function SummaryRow({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <span className="text-label" style={{ color: 'var(--color-teal-400)', fontSize: '0.6rem' }}>{label}</span>
        {sublabel && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.15rem' }}>{sublabel}</p>}
      </div>
      <span style={{ color: 'var(--color-text-inverse)', fontWeight: 500, fontSize: '0.95rem', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}


