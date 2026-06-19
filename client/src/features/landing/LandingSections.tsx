// ═══════════════════════════════════════════════════════════════
// samaramAI — Remaining Landing Sections (Sections 04–11)
// Severity, Multilingual, Offline, Family, Trust, Testimonials, CTA
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  WifiOff, Wifi, Cloud, Download, Users, Heart, Shield, CheckCircle2,
  Star, MapPin, ArrowRight, Lock, Server, Eye,
} from 'lucide-react';
import SectionReveal, { RevealItem } from '@/components/shared/SectionReveal';
import { SEVERITY_OPTIONS } from '@/types/symptom';
import { useIsMobile } from '@/hooks';
import { useTranslation } from '@/hooks/useTranslation';

// ═══ Section 05 — Emoji Severity System ═══
export function SeveritySection() {
  const { t } = useTranslation();
  return (
    <section className="section-light section-padding">
      <div className="container-max" style={{ textAlign: 'center' }}>
        <SectionReveal>
          <span className="text-label" style={{ color: 'var(--color-teal-500)', display: 'block', marginBottom: '0.75rem' }}>
            {t('landing.severityTitle')}
          </span>
          <h2 className="text-display-lg" style={{ marginBottom: '0.75rem' }}>
            {t('landing.severityDesc')}
          </h2>
          <p className="text-editorial" style={{ color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>
            {t('landing.featuresSubtitle')}
          </p>
        </SectionReveal>

        <SectionReveal stagger>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', maxWidth: '900px', margin: '0 auto' }}>
            {SEVERITY_OPTIONS.map((opt) => (
              <RevealItem key={opt.level}>
                <motion.div
                  whileHover={{ y: -8, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    padding: '2rem 1.5rem',
                    borderRadius: 'var(--radius-xl)',
                    border: '2px solid var(--color-surface)',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <motion.span
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    style={{ fontSize: '4rem', display: 'block', marginBottom: '0.75rem' }}
                  >
                    {opt.emoji}
                  </motion.span>
                  <h4 className="text-label" style={{ color: 'var(--color-teal-500)', marginBottom: '0.5rem' }}>
                    {opt.label}
                  </h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {opt.description}
                  </p>
                </motion.div>
              </RevealItem>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

// ═══ Section 06 — Multilingual Showcase ═══
const languages = [
  { name: 'Telugu', native: 'తెలుగు', greeting: 'మీకు ఏమైంది?' },
  { name: 'Hindi', native: 'हिंदी', greeting: 'आपको क्या तकलीफ़ है?' },
  { name: 'Tamil', native: 'தமிழ்', greeting: 'உங்களுக்கு என்ன பிரச்சனை?' },
  { name: 'Kannada', native: 'ಕನ್ನಡ', greeting: 'ನಿಮಗೆ ಏನು ಸಮಸ್ಯೆ?' },
  { name: 'Malayalam', native: 'മലയാളം', greeting: 'നിങ്ങൾക്ക് എന്താണ് സംഭവിച്ചത്?' },
  { name: 'English', native: 'English', greeting: 'What seems to be the problem?' },
];

export function MultilingualSection() {
  const { t } = useTranslation();
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((i) => (i + 1) % languages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section-dark section-padding" id="languages">
      <div className="container-max" style={{ textAlign: 'center' }}>
        <SectionReveal>
          <span className="text-label" style={{ color: 'var(--color-teal-400)', display: 'block', marginBottom: '0.75rem' }}>
            {t('landing.multilingualTitle')}
          </span>

          {/* Morphing headline */}
          <div style={{ height: 'clamp(3rem, 6vw, 5rem)', marginBottom: '2rem', overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
              <motion.h2
                key={activeIdx}
                className="text-display-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                style={{ color: 'var(--color-text-inverse)' }}
              >
                {languages[activeIdx].greeting}
              </motion.h2>
            </AnimatePresence>
          </div>

          <p className="text-editorial" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>
            {t('landing.multilingualDesc')}
          </p>
        </SectionReveal>

        <SectionReveal stagger>
          <div className="flex flex-wrap justify-center gap-3">
            {languages.map((lang, i) => (
              <RevealItem key={lang.name}>
                <motion.button
                  onClick={() => setActiveIdx(i)}
                  whileHover={{ y: -4 }}
                  className={i === activeIdx ? 'glass' : ''}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: i === activeIdx ? '1px solid var(--color-teal-500)' : '1px solid rgba(255,255,255,0.12)',
                    background: i === activeIdx ? 'rgba(13,148,136,0.15)' : 'transparent',
                    color: i === activeIdx ? 'var(--color-teal-400)' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s',
                  }}
                >
                  <span style={{ display: 'block', fontWeight: 600 }}>{lang.native}</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.6, marginTop: '2px' }}>{lang.name}</span>
                </motion.button>
              </RevealItem>
            ))}
          </div>
        </SectionReveal>

        {/* Colloquial mapping examples */}
        <SectionReveal>
          <div style={{ marginTop: '3rem', maxWidth: '600px', margin: '3rem auto 0' }}>
            {[
              { colloquial: 'pet mein dard', medical: 'Abdominal Pain' },
              { colloquial: 'sir dard', medical: 'Headache' },
              { colloquial: 'sine mein jalan', medical: 'Heartburn' },
            ].map((pair) => (
              <div
                key={pair.colloquial}
                className="flex items-center justify-between glass"
                style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}
              >
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontStyle: 'italic' }}>"{pair.colloquial}"</span>
                <ArrowRight size={14} color="var(--color-teal-400)" />
                <span style={{ color: 'var(--color-teal-400)', fontSize: '0.9rem', fontWeight: 600 }}>{pair.medical}</span>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

// ═══ Section 07 — Offline First ═══
export function OfflineSection() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  return (
    <section className="section-light section-padding">
      <div className="container-max">
        <SectionReveal>
          <div className="grid gap-8 items-center" style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
            <div>
              <span className="text-label" style={{ color: 'var(--color-teal-500)', display: 'block', marginBottom: '0.75rem' }}>
                {t('landing.offlineTitle')}
              </span>
              <h2 className="text-display-md" style={{ marginBottom: '1.5rem' }}>
                {t('landing.offlineDesc')}
              </h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: WifiOff, textKey: 'landing.offlineDesc' as const },
                  { icon: Download, textKey: 'landing.offlineDesc' as const },
                  { icon: Shield, textKey: 'landing.offlineDesc' as const },
                  { icon: Cloud, textKey: 'landing.offlineDesc' as const },
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    whileInView={{ opacity: 1, x: 0 }}
                    initial={{ opacity: 0, x: -20 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                    style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--color-teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={16} color="var(--color-teal-500)" />
                    </div>
                    {t(item.textKey)}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div style={{ width: 180, height: 300, borderRadius: 'var(--radius-2xl)', border: '2px solid var(--color-surface)', background: 'white', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                  <WifiOff size={40} color="var(--color-teal-500)" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{t('landing.offlineTitle')}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{t('landing.offlineDesc')}</p>
                  <div style={{ marginTop: '1.5rem' }}>
                    <div className="flex items-center gap-2" style={{ fontSize: '0.65rem', color: 'var(--color-success)', justifyContent: 'center' }}>
                      <Wifi size={12} /> <span>3 actions queued</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

// ═══ Section 08 — Family Care ═══
export function FamilyCareSection() {
  const { t } = useTranslation();
  return (
    <section className="section-dark section-padding">
      <div className="container-max" style={{ textAlign: 'center' }}>
        <SectionReveal>
          <span className="text-label" style={{ color: 'var(--color-teal-400)', display: 'block', marginBottom: '0.75rem' }}>
            {t('landing.familyCareTitle')}
          </span>
          <h2 className="text-editorial-lg" style={{ color: 'var(--color-text-inverse)', marginBottom: '0.5rem', maxWidth: '600px', margin: '0 auto 0.5rem' }}>
            "{t('landing.familyCareDesc')}"
          </h2>
          <p className="text-body" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>
            {t('landing.familyCareDesc')}
          </p>
        </SectionReveal>

        <SectionReveal stagger>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Amma', relation: 'Mother, 68', status: 'BP elevated', statusColor: 'var(--color-warning)', avatar: '#A78BFA' },
              { name: 'You', relation: 'Self, 34', status: 'All clear', statusColor: 'var(--color-success)', avatar: '#60A5FA' },
              { name: 'Nanna', relation: 'Father, 72', status: 'Med due 2hr', statusColor: 'var(--color-blue-400)', avatar: '#34D399' },
              { name: 'Priya', relation: 'Daughter, 8', status: 'Vaccination due', statusColor: 'var(--color-teal-400)', avatar: '#FBBF24' },
            ].map((member) => (
              <RevealItem key={member.name}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
                  className="glass"
                  style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', width: '160px', textAlign: 'center', cursor: 'pointer' }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: member.avatar, margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} color="white" />
                  </div>
                  <p style={{ color: 'var(--color-text-inverse)', fontWeight: 600, fontSize: '1rem', marginBottom: '0.15rem' }}>{member.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>{member.relation}</p>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.65rem', background: `${member.statusColor}20`, color: member.statusColor, fontWeight: 500 }}>
                    {member.status}
                  </span>
                </motion.div>
              </RevealItem>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

// ═══ Section 09 — Trust & Safety ═══
export function TrustSection() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  return (
    <section className="section-dark section-padding" id="safety">
      <div className="container-max">
        <SectionReveal>
          <span className="text-label" style={{ color: 'var(--color-teal-400)', display: 'block', marginBottom: '0.75rem', textAlign: 'center' }}>
            {t('landing.trustTitle')}
          </span>
          <h2 className="text-display-md" style={{ textAlign: 'center', color: 'var(--color-text-inverse)', marginBottom: '3rem' }}>
            {t('landing.trustDesc')}
          </h2>
        </SectionReveal>

        <div className="grid gap-8" style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
          {/* Safety checklist */}
          <SectionReveal stagger>
            <div className="flex flex-col gap-3">
              {[
                { icon: Lock, text: 'End-to-end encryption on all health data' },
                { icon: Server, text: 'Emergency detection is rule-based — never AI' },
                { icon: Eye, text: 'No data sold to third parties — ever' },
                { icon: Shield, text: 'Contradiction detection prevents misdiagnosis' },
                { icon: CheckCircle2, text: 'Mandatory confidence thresholds on all AI output' },
                { icon: Heart, text: 'Medical disclaimer on every analysis result' },
              ].map((item) => (
                <RevealItem key={item.text}>
                  <div className="flex items-center gap-3 glass" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <item.icon size={18} color="var(--color-teal-400)" style={{ flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{item.text}</span>
                  </div>
                </RevealItem>
              ))}
            </div>
          </SectionReveal>

          {/* Comparison Matrix */}
          <SectionReveal>
            <div className="glass" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.5)' }}>{t('nav.features')}</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-teal-400)', fontWeight: 700 }}>samaramAI</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Others</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Offline Mode', true, false],
                    ['Voice in 6 Languages', true, false],
                    ['Rule-Based Emergency', true, false],
                    ['Drug Interactions', true, true],
                    ['Family Profiles', true, false],
                    ['Fact Checker', true, false],
                  ].map(([feature, us, them]) => (
                    <tr key={feature as string} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.6)' }}>{feature as string}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {us ? <CheckCircle2 size={16} color="var(--color-teal-400)" /> : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {them ? <CheckCircle2 size={16} color="rgba(255,255,255,0.2)" /> : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}

// ═══ Section 10 — Testimonials ═══
export function TestimonialsSection() {
  const { t } = useTranslation();
  return (
    <section className="section-dark section-padding">
      <div className="container-max">
        <SectionReveal>
          <span className="text-label" style={{ color: 'var(--color-teal-400)', display: 'block', marginBottom: '0.75rem', textAlign: 'center' }}>
            {t('landing.testimonialTitle')}
          </span>
          <h2 className="text-display-md" style={{ textAlign: 'center', color: 'var(--color-text-inverse)', marginBottom: '3rem' }}>
            {t('landing.testimonialTitle')}
          </h2>
        </SectionReveal>

        <SectionReveal stagger>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {[
              {
                quote: "My mother had chest pain at 2 AM. samaramAI detected a cardiac pattern and connected us to 108 before I even understood what was happening. The hospital said those 10 minutes saved her.",
                name: 'Lakshmi Reddy',
                location: 'Vijayawada, Andhra Pradesh',
                avatar: '#A78BFA',
              },
              {
                quote: "I scanned my father's medicine strip and samaramAI found a dangerous interaction with his blood pressure pills. Our pharmacist confirmed it. This app caught what humans missed.",
                name: 'Rajesh Kumar',
                location: 'Patna, Bihar',
                avatar: '#60A5FA',
              },
              {
                quote: "In our village, the nearest doctor is 40km away. With samaramAI, I can check my children's symptoms in Tamil, even without internet. It tells me whether to travel or wait. This is priceless.",
                name: 'Meenakshi S.',
                location: 'Dindigul, Tamil Nadu',
                avatar: '#34D399',
              },
            ].map((testimonial) => (
              <RevealItem key={testimonial.name}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="glass"
                  style={{ borderRadius: 'var(--radius-xl)', padding: '2rem', height: '100%' }}
                >
                  <div className="flex gap-1" style={{ marginBottom: '1rem' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill="var(--color-warning)" color="var(--color-warning)" />
                    ))}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: testimonial.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={18} color="white" />
                    </div>
                    <div>
                      <p style={{ color: 'var(--color-text-inverse)', fontWeight: 600, fontSize: '0.9rem' }}>{testimonial.name}</p>
                      <p className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                        <MapPin size={10} /> {testimonial.location}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </RevealItem>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

// ═══ Section 11 — Final CTA ═══
export function FinalCTASection() {
  const { t } = useTranslation();
  return (
    <section
      className="section-padding"
      style={{
        background: 'linear-gradient(135deg, var(--color-midnight) 0%, #0A2628 50%, var(--color-midnight) 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      <div className="container-max relative z-10">
        <SectionReveal>
          <p className="text-editorial-lg" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '700px', margin: '0 auto 2rem' }}>
            "{t('landing.finalCtaDesc')}"
          </p>
          <h2 className="text-display-lg" style={{ color: 'var(--color-text-inverse)', marginBottom: '2.5rem' }}>
            {t('landing.finalCtaTitle')}
          </h2>
          <div className="flex flex-wrap justify-center gap-4" style={{ marginBottom: '3rem' }}>
            <Link to="/auth/signup" className="btn-primary no-underline" style={{ fontSize: '1.1rem', padding: '1.1rem 2.5rem' }}>
              {t('landing.finalCtaButton')} <ArrowRight size={18} />
            </Link>
            <Link to="/symptom-checker" className="btn-secondary no-underline" style={{ borderColor: 'var(--color-teal-400)', color: 'var(--color-teal-400)' }}>
              {t('dashboard.checkSymptoms')}
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
            {['🔒 Encrypted', `🇮🇳 ${t('landing.trustTitle')}`, `📱 ${t('landing.offlineTitle')}`, `🗣️ 6 ${t('auth.statLanguages')}`].map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
