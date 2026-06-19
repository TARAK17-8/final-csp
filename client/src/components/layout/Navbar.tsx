// ═══════════════════════════════════════════════════════════════
// samaramAI — Cinematic Navbar
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Plus } from 'lucide-react';
import { NAV_LINKS, APP_NAME } from '@/lib/constants';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSelector from '@/components/shared/LanguageSelector';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const { t } = useTranslation();

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  // Don't show on non-landing pages (they have their own navs)
  const showGlassNav = isScrolled || !isLanding;

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          showGlassNav
            ? 'glass-dark shadow-lg'
            : 'bg-transparent'
        }`}
        style={{ padding: '0 clamp(1.5rem, 5vw, 4rem)' }}
      >
        <nav className="container-max flex items-center justify-between" style={{ height: '72px' }}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
              }}
            >
              <Plus size={20} color="white" strokeWidth={3} />
            </div>
            <span
              className="text-display-sm"
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                color: isLanding ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {isLanding &&
              NAV_LINKS.map((link) => (
                <a
                  key={link.labelKey}
                  href={link.href}
                  className="text-label relative group no-underline"
                  style={{
                    color: 'var(--color-text-inverse)',
                    opacity: 0.8,
                    fontSize: '0.75rem',
                    transition: 'opacity 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
                >
                  {t(link.labelKey)}
                  <span
                    className="absolute bottom-0 left-0 w-0 group-hover:w-full transition-all duration-300"
                    style={{
                      height: '1px',
                      background: 'var(--color-teal-400)',
                    }}
                  />
                </a>
              ))}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-4">
            <LanguageSelector variant="navbar" />
            <Link
              to="/auth/login"
              className="hidden md:inline-flex items-center px-5 py-2 rounded-full text-label no-underline"
              style={{
                fontSize: '0.8rem',
                border: '1.5px solid rgba(255,255,255,0.3)',
                color: 'var(--color-text-inverse)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'var(--color-teal-400)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              {t('nav.startFree')}
            </Link>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-inverse)',
                cursor: 'pointer',
              }}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            style={{ background: 'var(--color-midnight)' }}
          >
            <motion.nav
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-8"
            >
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link.labelKey}
                  variants={fadeInUp}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="text-display-md no-underline"
                  style={{ color: 'var(--color-text-inverse)' }}
                >
                  {t(link.labelKey)}
                </motion.a>
              ))}
              <motion.div variants={fadeInUp}>
                <Link
                  to="/auth/login"
                  className="btn-primary no-underline"
                  onClick={() => setIsMobileOpen(false)}
                  style={{ marginTop: '1rem' }}
                >
                  {t('nav.startFree')} →
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
