// ═══════════════════════════════════════════════════════════════
// samaramAI — Auth Layout
// Split screen: 60% cinematic left + 40% clean form right
// ═══════════════════════════════════════════════════════════════

import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Shield, Users, Activity } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useIsMobile } from '@/hooks';
import { useTranslation } from '@/hooks/useTranslation';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      {/* ═══ Left Panel — Cinematic Brand ═══ */}
      {!isMobile && (
        <div
          className="relative overflow-hidden flex flex-col justify-between"
          style={{
            width: '60%',
            background: 'linear-gradient(170deg, #0B1120 0%, #0A2628 60%, #0B1120 100%)',
            padding: 'clamp(2rem, 4vw, 4rem)',
          }}
        >
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', top: '20%', right: '-10%',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }} />
          <div className="film-grain" />

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline relative z-10">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
              }}
            >
              <Plus size={20} color="white" strokeWidth={3} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.35rem',
              color: 'var(--color-text-inverse)', letterSpacing: '-0.03em',
            }}>
              {APP_NAME}
            </span>
          </Link>

          {/* Center content */}
          <div className="relative z-10" style={{ maxWidth: '420px' }}>
            <h1 className="text-display-lg" style={{ color: 'var(--color-text-inverse)', marginBottom: '1.5rem' }}>
              {t('hero.headline1')} <span style={{ color: 'var(--color-teal-400)' }}>{t('hero.headline2')}</span> {t('hero.headline3')}
            </h1>
            <p className="text-body" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>
              {t('hero.subtext')}
            </p>

            {/* Floating stats */}
            <div className="flex flex-col gap-3">
              {[
                { icon: Activity, stat: '2M+', label: t('auth.statUsers') },
                { icon: Users, stat: '6', label: t('auth.statLanguages') },
                { icon: Shield, stat: '99.9%', label: t('auth.statAvailable') },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 glass"
                  style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', width: 'fit-content' }}
                >
                  <item.icon size={18} color="var(--color-teal-400)" />
                  <span style={{ color: 'var(--color-teal-400)', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{item.stat}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom tagline */}
          <p className="relative z-10" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
            {t('hero.subtext')}
          </p>
        </div>
      )}

      {/* ═══ Right Panel — Clean Form ═══ */}
      <div
        className="flex flex-col justify-center"
        style={{
          width: isMobile ? '100%' : '40%',
          padding: 'clamp(2rem, 5vw, 4rem)',
          background: 'var(--color-cream)',
          overflowY: 'auto',
        }}
      >
        {/* Mobile logo */}
        {isMobile && (
          <Link to="/" className="flex items-center gap-2 no-underline" style={{ marginBottom: '2rem' }}>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
              }}
            >
              <Plus size={18} color="white" strokeWidth={3} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem',
              color: 'var(--color-text-primary)', letterSpacing: '-0.03em',
            }}>
              {APP_NAME}
            </span>
          </Link>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: '400px', width: '100%', margin: isMobile ? '0' : '0 auto' }}
        >
          <h2 className="text-display-sm" style={{ marginBottom: '0.5rem' }}>{title}</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '2rem' }}>{subtitle}</p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
