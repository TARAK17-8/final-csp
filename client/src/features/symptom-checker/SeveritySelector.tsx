// ═══════════════════════════════════════════════════════════════
// samaramAI — Emoji Severity Selector
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { useSymptomStore } from '@/stores/symptomStore';
import { SEVERITY_OPTIONS } from '@/types/symptom';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { useIsMobile } from '@/hooks';
import { useTranslation } from '@/hooks/useTranslation';

export default function SeveritySelector() {
  const { setSeverity } = useSymptomStore();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h2 className="text-display-md" style={{ marginBottom: '0.5rem' }}>{t('symptom.howSevere')}</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>{t('symptom.selectBodyRegion')}</p>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4"
        style={{ gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }}
      >
        {SEVERITY_OPTIONS.map((opt) => (
          <motion.button
            key={opt.level}
            variants={fadeInUp}
            whileHover={{ y: -8, boxShadow: '0 12px 40px rgba(0,0,0,0.3)', borderColor: 'var(--color-teal-500)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSeverity(opt.level)}
            className="glass"
            style={{
              padding: '1.5rem 1rem',
              borderRadius: 'var(--radius-xl)',
              cursor: 'pointer',
              textAlign: 'center',
              border: '1.5px solid rgba(255,255,255,0.08)',
              transition: 'border-color 0.3s',
            }}
          >
            <motion.span
              whileHover={{ scale: 1.25 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{ fontSize: '4rem', display: 'block', marginBottom: '0.75rem', lineHeight: 1 }}
            >
              {opt.emoji}
            </motion.span>
            <span className="text-label" style={{ color: 'var(--color-teal-400)', display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>
              {t(`symptom.severity.${opt.level}.label` as any)}
            </span>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {t(`symptom.severity.${opt.level}.desc` as any)}
            </p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
