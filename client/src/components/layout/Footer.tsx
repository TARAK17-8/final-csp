// ═══════════════════════════════════════════════════════════════
// samaramAI — Footer
// ═══════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { Plus, Globe, ExternalLink, Heart } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useTranslation } from '@/hooks/useTranslation';

export default function Footer() {
  const { t } = useTranslation();

  const platformLinks = [
    { labelKey: 'footer.symptomChecker' as const, href: '/symptom-checker' },
    { labelKey: 'footer.medicineScanner' as const, href: '/medicine-scanner' },
    { labelKey: 'footer.emergencyHelp' as const, href: '/emergency-care' },
    { labelKey: 'footer.healthRecords' as const, href: '/health-records' },
  ];

  const supportLinks = [
    { labelKey: 'footer.helpCenter' as const, href: '#' },
    { labelKey: 'footer.privacyPolicy' as const, href: '#' },
    { labelKey: 'footer.termsOfService' as const, href: '#' },
    { labelKey: 'footer.contactUs' as const, href: '#' },
  ];

  return (
    <footer className="section-dark" style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 6rem) 2rem' }}>
      <div className="container-max">
        <div className="grid gap-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 no-underline" style={{ marginBottom: '1rem' }}>
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
                }}
              >
                <Plus size={18} color="white" strokeWidth={3} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-text-inverse)' }}>
                {APP_NAME}
              </span>
            </Link>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '280px' }}>
              {t('hero.subtext')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-label" style={{ color: 'var(--color-teal-400)', marginBottom: '1rem' }}>{t('footer.platform')}</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {platformLinks.map((item) => (
                <li key={item.labelKey}>
                  <Link to={item.href} className="no-underline" style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', transition: 'color 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-inverse)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-label" style={{ color: 'var(--color-teal-400)', marginBottom: '1rem' }}>{t('footer.support')}</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {supportLinks.map((item) => (
                <li key={item.labelKey}>
                  <Link to={item.href} className="no-underline" style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', transition: 'color 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-inverse)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-label" style={{ color: 'var(--color-teal-400)', marginBottom: '1rem' }}>{t('footer.connect')}</h4>
            <div className="flex gap-3" style={{ marginBottom: '1.5rem' }}>
              {[Globe, ExternalLink, Heart].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 40,
                    height: 40,
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'var(--color-text-muted)',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-teal-500)';
                    e.currentTarget.style.color = 'var(--color-teal-400)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                  }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '3rem 0 1.5rem' }} />

        {/* Medical Disclaimer */}
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(185, 28, 28, 0.08)',
          border: '1px solid rgba(185, 28, 28, 0.15)',
          marginBottom: '1.5rem',
        }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', lineHeight: 1.7 }}>
            <strong style={{ color: '#EF4444' }}>{t('footer.medicalDisclaimer')}</strong> {t('footer.disclaimerText')}
          </p>
        </div>

        {/* Copyright */}
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
