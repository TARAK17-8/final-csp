// ═══════════════════════════════════════════════════════════════
// samaramAI — Cinematic Hero Section
// Three-Plane Composition: Atmosphere → Typography → Content
// ═══════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Scan, Activity, Shield, WifiOff, Users, Mic, MapPin, Languages, FileHeart } from 'lucide-react';
import ParticleCanvas from '@/components/shared/ParticleCanvas';
import ECGWaveform from '@/components/shared/ECGWaveform';
import FloatingCard from '@/components/shared/FloatingCard';
import { useIsMobile } from '@/hooks';
import { useTranslation } from '@/hooks/useTranslation';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { FEATURE_STRIP_ITEMS } from '@/lib/constants';

// Feature strip icon map
const iconMap: Record<string, React.ReactNode> = {
  'map-pin': <MapPin size={22} />,
  scan: <Scan size={22} />,
  bot: <Mic size={22} />,
  shield: <Shield size={22} />,
  'file-heart': <FileHeart size={22} />,
  languages: <Languages size={22} />,
  activity: <Activity size={22} />,
};

export default function HeroSection() {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();

  // Parallax transforms
  const bgY = useTransform(scrollYProgress, [0, 0.3], [0, 60]);
  const midY = useTransform(scrollYProgress, [0, 0.3], [0, 40]);
  const fgY = useTransform(scrollYProgress, [0, 0.3], [0, 15]);

  return (
    <section
      id="hero"
      className="relative overflow-hidden"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'linear-gradient(170deg, #0B1120 0%, #0E1B30 30%, #0A2628 60%, #0B1120 100%)',
      }}
    >
      {/* ═══ PLANE 1 — Background Atmosphere ═══ */}
      <motion.div
        style={{ y: isMobile ? 0 : bgY }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Ambient light bloom */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '15%',
            width: 'clamp(300px, 40vw, 600px)',
            height: 'clamp(300px, 40vw, 600px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '10%',
            width: 'clamp(200px, 30vw, 400px)',
            height: 'clamp(200px, 30vw, 400px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Particle system */}
        <ParticleCanvas />

        {/* ECG Waveform */}
        <ECGWaveform />

        {/* Film grain */}
        <div className="film-grain" />
      </motion.div>

      {/* ═══ PLANE 2 — Massive samaramAI Typography ═══ */}
      <motion.div
        style={{ y: isMobile ? 0 : midY }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(4rem, 14vw, 14rem)',
            fontWeight: 300,
            letterSpacing: '-0.04em',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,255,255,0.06)',
            userSelect: 'none',
            lineHeight: 1,
            animation: 'breathe 8s ease-in-out infinite',
          }}
        >
          samaramAI
        </motion.h1>
      </motion.div>

      {/* ═══ PLANE 3 — Foreground Content ═══ */}
      <motion.div
        style={{ y: isMobile ? 0 : fgY }}
        className="relative z-10"
      >
        <div className="container-max" style={{ padding: 'clamp(6rem, 12vh, 10rem) clamp(1.5rem, 5vw, 6rem) clamp(2rem, 5vh, 4rem)' }}>
          <div className="grid gap-12" style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', alignItems: 'center' }}>
            {/* Left — Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{ maxWidth: '600px' }}
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} style={{ marginBottom: '1.5rem' }}>
                <span
                  className="text-label"
                  style={{
                    display: 'inline-block',
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(13, 148, 136, 0.3)',
                    color: 'var(--color-teal-400)',
                    fontSize: '0.7rem',
                    background: 'rgba(13, 148, 136, 0.08)',
                  }}
                >
                  {t('hero.badge')}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h2 variants={fadeInUp} className="text-display-hero" style={{ color: 'var(--color-text-inverse)', marginBottom: '1.5rem' }}>
                {t('hero.headline1')}{' '}
                <span style={{ color: 'var(--color-teal-400)' }}>{t('hero.headline2')}</span>{' '}
                {t('hero.headline3')}
              </motion.h2>

              {/* Subtext */}
              <motion.p variants={fadeInUp} className="text-body-lg" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '2.5rem', maxWidth: '520px' }}>
                {t('hero.subtext')}
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link to="/symptom-checker" className="btn-primary no-underline" style={{ fontSize: '1.05rem' }}>
                  {t('hero.cta1')} <ArrowRight size={18} />
                </Link>
                <Link to="/medicine-scanner" className="btn-secondary no-underline" style={{ borderColor: 'var(--color-teal-400)', color: 'var(--color-teal-400)' }}>
                  <Scan size={18} /> {t('hero.cta2')}
                </Link>
              </motion.div>
            </motion.div>

            {/* Right — Floating UI Preview Cards */}
            {!isMobile && (
              <div className="relative" style={{ height: '500px' }}>
                {/* Card 1 — AI Analysis Result */}
                <FloatingCard
                  amplitude={14} duration={7} phase={0}
                  style={{ position: 'absolute', top: '5%', left: '10%', width: '220px' }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                    <Activity size={16} color="var(--color-teal-400)" />
                    <span className="text-label" style={{ color: 'var(--color-teal-400)', fontSize: '0.65rem' }}>{t('hero.floatCard1Title')}</span>
                  </div>
                  <p style={{ color: 'var(--color-text-inverse)', fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>{t('hero.mock.acidReflux')}</p>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '78%' }}
                      transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, var(--color-teal-500), var(--color-teal-400))' }}
                    />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>78% {t('symptom.confidence')} · {t('symptom.urgencyLow')}</span>
                </FloatingCard>

                {/* Card 2 — Voice Assistant */}
                <FloatingCard
                  amplitude={10} duration={5.5} phase={1.2}
                  style={{ position: 'absolute', top: '35%', right: '5%', width: '200px' }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                    <Mic size={16} color="var(--color-blue-400)" />
                    <span className="text-label" style={{ color: 'var(--color-blue-400)', fontSize: '0.65rem' }}>{t('hero.floatCard2Title')}</span>
                  </div>
                  <p style={{ color: 'var(--color-text-inverse)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{t('hero.floatCard2Desc')}</p>
                  <div className="flex gap-1 items-end" style={{ height: '24px' }}>
                    {[12, 20, 8, 16, 24, 10, 18].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [h, h * 0.4, h] }}
                        transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ width: '3px', borderRadius: '2px', background: 'var(--color-blue-400)' }}
                      />
                    ))}
                  </div>
                </FloatingCard>

                {/* Card 3 — Emergency Protection */}
                <FloatingCard
                  amplitude={8} duration={8} phase={2.5}
                  style={{ position: 'absolute', bottom: '25%', left: '5%', width: '190px' }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                    <Shield size={16} color="var(--color-success)" />
                    <span className="text-label" style={{ color: 'var(--color-success)', fontSize: '0.65rem' }}>{t('hero.floatCard3Title')}</span>
                  </div>
                  <p style={{ color: 'var(--color-text-inverse)', fontSize: '0.9rem', fontWeight: 600 }}>{t('hero.floatCard3Desc')}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{t('hero.mock.connected108')}</p>
                </FloatingCard>

                {/* Card 4 — Offline Mode */}
                <FloatingCard
                  amplitude={11} duration={6.5} phase={3.8}
                  style={{ position: 'absolute', bottom: '5%', right: '15%', width: '185px' }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                    <WifiOff size={16} color="var(--color-warning)" />
                    <span className="text-label" style={{ color: 'var(--color-warning)', fontSize: '0.65rem' }}>{t('landing.offlineTitle')}</span>
                  </div>
                  <p style={{ color: 'var(--color-text-inverse)', fontSize: '0.9rem', fontWeight: 600 }}>{t('landing.offlineTitle')}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{t('landing.offlineDesc')}</p>
                </FloatingCard>

                {/* Card 5 — Family Care */}
                <FloatingCard
                  amplitude={9} duration={7.5} phase={0.5}
                  style={{ position: 'absolute', top: '10%', right: '20%', width: '180px' }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                    <Users size={16} color="var(--color-teal-300)" />
                    <span className="text-label" style={{ color: 'var(--color-teal-300)', fontSize: '0.65rem' }}>{t('landing.familyCareTitle')}</span>
                  </div>
                  <div className="flex items-center gap-1" style={{ marginBottom: '0.3rem' }}>
                    {['#A78BFA', '#60A5FA', '#34D399', '#FBBF24'].map((c, i) => (
                      <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '2px solid var(--color-midnight)', marginLeft: i > 0 ? '-6px' : 0 }} />
                    ))}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{t('landing.familyCareDesc')}</p>
                </FloatingCard>
              </div>
            )}
          </div>
        </div>

        {/* ═══ Bottom Feature Strip ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            padding: '0 clamp(1.5rem, 5vw, 6rem)',
            paddingBottom: 'clamp(2rem, 5vh, 4rem)',
          }}
        >
          <div
            className="container-max flex gap-3"
            style={{
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              scrollbarWidth: 'none',
            }}
          >
            {FEATURE_STRIP_ITEMS.map((item, i) => (
              <Link key={item.labelKey} to={item.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.08 }}
                  className="glass flex flex-col items-center gap-2"
                  style={{
                    padding: '1rem 1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    minWidth: '130px',
                    textAlign: 'center',
                    flex: '0 0 auto',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--color-teal-500)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(13, 148, 136, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-teal-400)',
                    }}
                  >
                    {iconMap[item.icon]}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {t(item.labelKey)}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
