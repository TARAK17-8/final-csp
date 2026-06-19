// ═══════════════════════════════════════════════════════════════
// samaramAI — "Why samaramAI Exists" Section
// Dark cinematic section — documentary moment
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { Heart, AlertTriangle, MessageCircle, User } from 'lucide-react';
import SectionReveal, { RevealItem } from '@/components/shared/SectionReveal';
import AnimatedCounter from '@/components/shared/AnimatedCounter';
import { useTranslation } from '@/hooks/useTranslation';

export default function WhySection() {
  const { t } = useTranslation();

  const stats = [
    { icon: Heart, value: 68, suffix: '%', headline: t('landing.stat1Label'), desc: t('landing.stat1Label'), color: 'var(--color-teal-400)' },
    { icon: AlertTriangle, prefix: '₹', value: 85000, suffix: ' Cr', headline: t('landing.stat2Label'), desc: t('landing.stat2Label'), color: 'var(--color-warning)' },
    { icon: MessageCircle, value: 84, suffix: '%', headline: t('landing.stat3Label'), desc: t('landing.stat3Label'), color: 'var(--color-emergency)' },
    { icon: User, value: 1, suffix: ' in 3', headline: t('landing.whyExists'), desc: t('landing.whySubtext'), color: 'var(--color-blue-400)' },
  ];

  return (
    <section className="section-dark section-padding" id="why">
      <div className="container-max">
        {/* Section Header */}
        <SectionReveal>
          <div className="flex items-center gap-4" style={{ marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-label" style={{ color: 'var(--color-teal-400)' }}>{t('landing.whyExists')}</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>
        </SectionReveal>

        <SectionReveal>
          <p className="text-editorial-lg" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', maxWidth: '700px', margin: '0 auto 4rem' }}>
            "{t('landing.whySubtext')}"
          </p>
        </SectionReveal>

        {/* Stats Grid */}
        <SectionReveal stagger>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {stats.map((stat, idx) => (
              <RevealItem key={idx}>
                <motion.div
                  className="glass"
                  style={{
                    borderRadius: 'var(--radius-xl)',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'default',
                  }}
                  whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: `${stat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                    }}
                  >
                    <stat.icon size={22} color={stat.color} />
                  </div>

                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: stat.color, marginBottom: '0.5rem' }}>
                    <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </div>

                  <h3 style={{ color: 'var(--color-text-inverse)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    {stat.headline}
                  </h3>

                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {stat.desc}
                  </p>
                </motion.div>
              </RevealItem>
            ))}
          </div>
        </SectionReveal>

        {/* Editorial Quote */}
        <SectionReveal>
          <div
            className="grid gap-8"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              marginTop: '4rem',
              alignItems: 'center',
            }}
          >
            <p className="text-editorial-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
              "{t('landing.finalCtaDesc')}"
            </p>
            <p className="text-body" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('landing.trustDesc')}
            </p>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
