// ═══════════════════════════════════════════════════════════════
// samaramAI — Analysis Results & Emergency Screen
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Phone, MapPin, Share2, FileText, Stethoscope, ArrowRight, Shield } from 'lucide-react';
import { useSymptomStore } from '@/stores/symptomStore';
import { useTranslation } from '@/hooks/useTranslation';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { EMERGENCY_NUMBER_TEL } from '@/lib/constants';

export default function AnalysisResults() {
  const { analysis, currentStep } = useSymptomStore();
  const { t } = useTranslation();

  if (!analysis) return null;

  // ═══ EMERGENCY SCREEN ═══
  if (analysis.isEmergency || currentStep === 'emergency') {
    return <EmergencyScreen />;
  }

  // ═══ NORMAL RESULTS ═══
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ maxWidth: '600px', margin: '0 auto' }}>
      
      {/* LOW CONFIDENCE BANNER */}
      {analysis.lowConfidence && (
        <motion.div variants={fadeInUp} style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.2)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Stethoscope size={28} color="var(--color-warning)" />
          </div>
          <h3 style={{ color: 'var(--color-warning)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{t('symptom.assessment.needsDoctor')}</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {t('symptom.assessment.lowConfidenceDesc')}
          </p>
          <Link to="/nearby-hospitals" className="btn-secondary no-underline" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <MapPin size={16} /> {t('symptom.assessment.findDoctors')}
          </Link>
        </motion.div>
      )}

      <motion.div variants={fadeInUp} style={{ marginBottom: '2rem' }}>
        <h2 className="text-display-md" style={{ marginBottom: '0.5rem' }}>{t('symptom.assessment.yourAssessment')}</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>{t('symptom.assessment.basedOnSymptoms')}</p>
      </motion.div>

      {/* Urgency badge */}
      <motion.div variants={fadeInUp} style={{ marginBottom: '1.5rem' }}>
        <span style={{
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: analysis.urgencyLevel === 'high' ? 'rgba(185,28,28,0.15)' :
                     analysis.urgencyLevel === 'medium' ? 'rgba(217,119,6,0.15)' :
                     'rgba(5,150,105,0.15)',
          color: analysis.urgencyLevel === 'high' ? 'var(--color-emergency)' :
                 analysis.urgencyLevel === 'medium' ? 'var(--color-warning)' :
                 'var(--color-success)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {t(`symptom.urgency${analysis.urgencyLevel.charAt(0).toUpperCase() + analysis.urgencyLevel.slice(1)}` as any)?.split('—')[0]?.trim() || analysis.urgencyLevel} {t('symptom.assessment.urgency')}
        </span>
      </motion.div>

      {/* Condition cards */}
      {analysis.conditions.map((condition, i) => (
        <motion.div
          key={condition.name}
          variants={fadeInUp}
          className="glass"
          style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1rem' }}
        >
          <div className="flex items-start justify-between" style={{ marginBottom: '0.75rem' }}>
            <div>
              <p style={{ color: 'var(--color-text-inverse)', fontWeight: 600, fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>
                {condition.plainName}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{condition.name}</p>
            </div>
            <span style={{ color: 'var(--color-teal-400)', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
              {condition.confidence}%
            </span>
          </div>

          {/* Animated confidence bar */}
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', marginBottom: '0.75rem' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${condition.confidence}%` }}
              transition={{ duration: 1, delay: 0.3 + i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: '100%', borderRadius: '3px',
                background: condition.confidence > 70 ? 'linear-gradient(90deg, var(--color-teal-500), var(--color-teal-400))' :
                           'linear-gradient(90deg, var(--color-blue-500), var(--color-blue-400))',
              }}
            />
          </div>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            {condition.description}
          </p>
        </motion.div>
      ))}

      {/* Next Steps */}
      <motion.div variants={fadeInUp} style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 className="text-display-sm" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{t('symptom.assessment.nextSteps')}</h3>
        <div className="flex flex-col gap-2">
          {analysis.nextSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--color-teal-400)', fontWeight: 700, flexShrink: 0, fontSize: '0.8rem', marginTop: '2px' }}>{i + 1}.</span>
              {step}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div variants={fadeInUp} className="flex flex-wrap gap-3" style={{ marginTop: '2rem' }}>
        <Link to="/nearby-hospitals" className="btn-primary no-underline">
          <MapPin size={16} /> {t('symptom.assessment.findDoctors')}
        </Link>
        <button className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
          <FileText size={16} /> {t('symptom.assessment.exportPdf')}
        </button>
        <button className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
          <Share2 size={16} /> {t('symptom.assessment.share')}
        </button>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        variants={fadeInUp}
        style={{
          marginTop: '2rem', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--color-warning)' }}>⚕️ {t('symptom.assessment.disclaimer')}</strong> {analysis.disclaimer}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ═══ EMERGENCY SCREEN ═══
function EmergencyScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'linear-gradient(180deg, #0B1120 0%, #1A0A0A 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(1.5rem, 5vw, 4rem)',
        overflow: 'auto',
      }}
    >
      <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        {/* Header */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="flex items-center justify-center gap-2"
          style={{ marginBottom: '1.5rem' }}
        >
          <Shield size={24} color="var(--color-emergency)" />
          <span className="text-label" style={{ color: 'var(--color-emergency)', fontSize: '0.75rem' }}>
            samaramAI EMERGENCY ALERT
          </span>
        </motion.div>

        <h1 className="text-display-md" style={{ color: 'var(--color-text-inverse)', marginBottom: '1rem' }}>
          Your symptoms suggest an emergency
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '1.05rem' }}>
          Please act immediately. Your safety is the priority.
        </p>

        {/* Call 108 button */}
        <motion.a
          href={EMERGENCY_NUMBER_TEL}
          animate={{ boxShadow: ['0 0 30px rgba(185,28,28,0.3)', '0 0 60px rgba(185,28,28,0.5)', '0 0 30px rgba(185,28,28,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="btn-emergency no-underline"
          style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}
        >
          <Phone size={24} /> Call 108 Now
        </motion.a>

        {/* First Aid */}
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h3 className="text-label" style={{ color: 'var(--color-teal-400)', marginBottom: '1rem' }}>WHILE WAITING FOR HELP</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Sit or lie down in a comfortable position',
              'Loosen any tight clothing',
              'Stay calm and take slow, deep breaths',
              'Do not eat or drink anything',
              'Keep your phone nearby and accessible',
            ].map((step) => (
              <li key={step} className="flex items-start gap-2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                <AlertTriangle size={14} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '3px' }} />
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Alert family */}
        <button
          onClick={() => {
            const msg = encodeURIComponent('EMERGENCY: I need help. My samaramAI health check detected an emergency pattern. Please call me immediately.');
            window.open(`https://wa.me/?text=${msg}`, '_blank');
          }}
          className="btn-secondary"
          style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}
        >
          Alert a Family Member (WhatsApp)
        </button>

        {/* Escape */}
        <Link
          to="/symptom-checker"
          style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textDecoration: 'none' }}
        >
          I'm okay — go back
        </Link>
      </div>
    </motion.div>
  );
}
