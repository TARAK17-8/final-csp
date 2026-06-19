// ═══════════════════════════════════════════════════════════════
// samaramAI — Features Showcase
// Alternating left/right split layouts, dark/light sections
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { Activity, Scan, AlertTriangle, Mic, FileHeart, Shield, Languages } from 'lucide-react';
import SectionReveal from '@/components/shared/SectionReveal';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks';

export default function FeaturesShowcase() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const features = [
  {
    icon: <Activity size={28} />,
    title: t('features.symptomChecker.title'),
    subtitle: t('features.symptomChecker.badge'),
    bullets: [
      t('features.symptomChecker.bullet1'),
      t('features.symptomChecker.bullet2'),
      t('features.symptomChecker.bullet3'),
    ],
    cta: t('features.symptomChecker.cta'),
    ctaLink: '/symptom-checker',
    dark: true,
    visual: (
      <div style={{ position: 'relative', width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ boxShadow: ['0 0 20px rgba(13,148,136,0.2)', '0 0 40px rgba(13,148,136,0.4)', '0 0 20px rgba(13,148,136,0.2)'] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ width: 180, height: 260, borderRadius: 'var(--radius-2xl)', border: '2px solid var(--color-teal-500)', position: 'relative', overflow: 'hidden' }}
        >
          {/* Simplified body silhouette */}
          <svg viewBox="0 0 100 160" style={{ width: '100%', height: '100%', padding: '10px' }}>
            <ellipse cx="50" cy="22" rx="14" ry="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <path d="M50 38 L50 90 M30 55 L70 55 M50 90 L35 135 M50 90 L65 135" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Glowing chest highlight */}
            <motion.circle
              cx="45" cy="60" r="12"
              fill="rgba(13,148,136,0.3)" stroke="var(--color-teal-400)" strokeWidth="1"
              animate={{ opacity: [0.4, 0.8, 0.4], r: [12, 14, 12] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        </motion.div>
      </div>
    ),
  },
  {
    icon: <Languages size={28} />,
    title: t('features.prescription.title'),
    subtitle: t('features.prescription.badge'),
    bullets: [
      t('features.prescription.bullet1'),
      t('features.prescription.bullet2'),
      t('features.prescription.bullet3'),
    ],
    cta: t('features.prescription.cta'),
    ctaLink: '/prescription-translator',
    dark: false,
    visual: (
      <div style={{ position: 'relative', width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Original Prescription */}
          <motion.div
            style={{ width: 120, height: 160, borderRadius: 'var(--radius-md)', background: 'white', padding: '1rem', border: '1px solid var(--color-surface)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <div style={{ width: '40%', height: 4, background: 'var(--color-surface-dark)', marginBottom: 12, borderRadius: 2 }} />
            <div style={{ width: '80%', height: 4, background: 'var(--color-surface-dark)', marginBottom: 8, borderRadius: 2 }} />
            <div style={{ width: '60%', height: 4, background: 'var(--color-surface-dark)', marginBottom: 8, borderRadius: 2 }} />
            <div style={{ width: '90%', height: 4, background: 'var(--color-surface-dark)', marginBottom: 8, borderRadius: 2 }} />
            <div style={{ marginTop: 20 }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
          </motion.div>

          {/* Translation Arrow */}
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ color: 'var(--color-teal-500)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </motion.div>

          {/* Translated Result */}
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1, boxShadow: ['0 0 0px rgba(13,148,136,0)', '0 0 20px rgba(13,148,136,0.2)', '0 0 0px rgba(13,148,136,0)'] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ width: 140, height: 180, borderRadius: 'var(--radius-md)', background: 'var(--color-teal-50)', padding: '1rem', border: '1px solid var(--color-teal-200)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 12 }}>
              <Languages size={16} color="var(--color-teal-600)" />
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-teal-700)' }}>{t('features.prescription.translated')}</span>
            </div>
            <div style={{ padding: '0.5rem', background: 'white', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{t('showcase.mock.paracetamol')}</span>
              <p style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{t('showcase.mock.take1Tablet')}</p>
            </div>
            <div style={{ padding: '0.5rem', background: 'white', borderRadius: 'var(--radius-sm)' }}>
               <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{t('showcase.mock.amoxicillin')}</span>
              <p style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{t('showcase.mock.takeTwiceDaily')}</p>
            </div>
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    icon: <Scan size={28} />,
    title: t('features.medicine.title'),
    subtitle: t('features.medicine.badge'),
    bullets: [
      t('features.medicine.bullet1'),
      t('features.medicine.bullet2'),
      t('features.medicine.bullet3'),
    ],
    cta: t('features.medicine.cta'),
    ctaLink: '/medicine-scanner',
    dark: true,
    visual: (
      <div style={{ position: 'relative', width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: 200,
            height: 280,
            borderRadius: 'var(--radius-2xl)',
            border: '2px solid var(--color-surface)',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--color-cream-dark)',
          }}
        >
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ width: '100%', height: '120px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Scan size={32} color="var(--color-teal-500)" />
            </div>
            <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>{t('showcase.mock.paracetamol500')}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{t('showcase.mock.ciplaExp')}</p>
            <div style={{ marginTop: '0.5rem', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-full)', background: 'var(--color-success-light)', display: 'inline-block' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--color-success)', fontWeight: 600 }}>{t('showcase.mock.noInteractions')}</span>
            </div>
          </div>
          {/* Scan line */}
          <motion.div
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'var(--color-teal-400)', opacity: 0.6 }}
          />
        </div>
      </div>
    ),
  },
  {
    icon: <AlertTriangle size={28} />,
    title: t('features.emergency.title'),
    subtitle: t('features.emergency.badge'),
    bullets: [
      t('features.emergency.bullet1'),
      t('features.emergency.bullet2'),
      t('features.emergency.bullet3'),
    ],
    cta: t('features.emergency.cta'),
    ctaLink: '#safety',
    dark: false,
    visual: (
      <div style={{ position: 'relative', width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ boxShadow: ['0 0 30px rgba(185,28,28,0.2)', '0 0 50px rgba(185,28,28,0.35)', '0 0 30px rgba(185,28,28,0.2)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 180,
            height: 180,
            borderRadius: '50%',
            border: '3px solid var(--color-emergency)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(185,28,28,0.08)',
          }}
        >
          <span style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white' }}>108</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{t('showcase.mock.tapToCall')}</span>
        </motion.div>
      </div>
    ),
  },
  {
    icon: <Mic size={28} />,
    title: t('features.voice.title'),
    subtitle: t('features.voice.badge'),
    bullets: [
      t('features.voice.bullet1'),
      t('features.voice.bullet2'),
      t('features.voice.bullet3'),
    ],
    cta: t('features.voice.cta'),
    ctaLink: '/ai-assistant',
    dark: true,
    visual: (
      <div style={{ width: '100%', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, var(--color-teal-500), var(--color-teal-800))', marginBottom: '1.5rem' }}
        />
        <div className="flex gap-1 items-end" style={{ height: '40px' }}>
          {[18, 30, 12, 24, 36, 16, 28].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [h, h * 0.3, h] }}
              transition={{ duration: 0.7 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '4px', borderRadius: '2px', background: 'var(--color-teal-400)' }}
            />
          ))}
        </div>
        <div className="flex gap-2 flex-wrap justify-center" style={{ marginTop: '1rem' }}>
          {[t('showcase.mock.langTelugu'), t('showcase.mock.langHindi'), t('showcase.mock.langTamil'), t('showcase.mock.langKannada'), t('showcase.mock.langEnglish')].map((lang) => (
            <span key={lang} style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}>
              {lang}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: <FileHeart size={28} />,
    title: t('features.records.title'),
    subtitle: t('features.records.badge'),
    bullets: [
      t('features.records.bullet1'),
      t('features.records.bullet2'),
      t('features.records.bullet3'),
    ],
    cta: t('features.records.cta'),
    ctaLink: '#',
    dark: false,
    visual: (
      <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 240, padding: '1.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-surface)', background: 'white' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{t('showcase.mock.vitals')}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{t('showcase.mock.today')}</span>
          </div>
          {[
            { label: t('showcase.mock.heartRate'), value: '72', unit: 'bpm', color: 'var(--color-emergency)' },
            { label: t('showcase.mock.bloodPressure'), value: '120/80', unit: 'mmHg', color: 'var(--color-teal-500)' },
            { label: t('showcase.mock.bloodSugar'), value: '98', unit: 'mg/dL', color: 'var(--color-success)' },
          ].map((v) => (
            <div key={v.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px solid var(--color-surface)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{v.label}</span>
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{v.value}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{v.unit}</span>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: v.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: <Shield size={28} />,
    title: t('features.factChecker.title'),
    subtitle: t('features.factChecker.badge'),
    bullets: [
      t('features.factChecker.bullet1'),
      t('features.factChecker.bullet2'),
      t('features.factChecker.bullet3'),
    ],
    cta: t('features.factChecker.cta'),
    ctaLink: '#',
    dark: true,
    visual: (
      <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 230 }}>
          <div style={{ padding: '0.75rem 1rem', borderRadius: '12px 12px 12px 2px', background: 'rgba(37, 211, 102, 0.15)', border: '1px solid rgba(37, 211, 102, 0.2)', marginBottom: '1rem', maxWidth: '200px' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{t('showcase.mock.diabetesClaim')}</p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.2)' }}
          >
            <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
              <AlertTriangle size={14} color="var(--color-emergency)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-emergency)' }}>{t('showcase.mock.misleading')}</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{t('showcase.mock.diabetesFact')}</p>
          </motion.div>
        </div>
      </div>
    ),
  },
];

  return (
    <div id="features">
      {features.map((feature, index) => (
        <section
          key={feature.subtitle}
          className={feature.dark ? 'section-dark' : 'section-light'}
          style={{ padding: 'clamp(3rem, 6vw, 6rem) clamp(1.5rem, 5vw, 6rem)' }}
        >
          <div className="container-max">
            <SectionReveal>
              <div
                className="grid gap-8 items-center"
                style={{
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  direction: !isMobile && index % 2 === 1 ? 'rtl' : 'ltr',
                }}
              >
                {/* Content side */}
                <div style={{ direction: 'ltr' }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--radius-md)',
                      background: feature.dark ? 'rgba(13,148,136,0.15)' : 'var(--color-teal-50)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-teal-500)',
                    }}>
                      {feature.icon}
                    </div>
                    <span className="text-label" style={{ color: 'var(--color-teal-500)' }}>{feature.subtitle}</span>
                  </div>

                  <h3 className="text-display-md" style={{ marginBottom: '1.5rem', color: feature.dark ? 'var(--color-text-inverse)' : 'var(--color-text-primary)' }}>
                    {feature.title}
                  </h3>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3" style={{ color: feature.dark ? 'rgba(255,255,255,0.65)' : 'var(--color-text-secondary)', fontSize: '1rem' }}>
                        <span style={{ color: 'var(--color-teal-500)', fontWeight: 700, flexShrink: 0 }}>→</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <a href={feature.ctaLink} className="btn-primary no-underline" style={{ display: 'inline-flex' }}>
                    {feature.cta}
                  </a>
                </div>

                {/* Visual side */}
                <div style={{ direction: 'ltr' }}>
                  {feature.visual}
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      ))}
    </div>
  );
}
