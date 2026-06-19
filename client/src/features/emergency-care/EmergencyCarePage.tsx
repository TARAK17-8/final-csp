// ═══════════════════════════════════════════════════════════════
// samaramAI — Emergency Care Page
// One-tap emergency access, 108 call, hospital finder, first aid
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, MapPin, AlertTriangle, Shield, ArrowLeft, Heart, Flame, Droplets, Zap, Bug } from 'lucide-react';
import { EMERGENCY_NUMBER_TEL } from '@/lib/constants';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { useTranslation } from '@/hooks/useTranslation';

const FIRST_AID_GUIDES = [
  { icon: <Heart size={24} />, title: 'Heart Attack', steps: ['Call 108 immediately', 'Have patient sit or lie down', 'Give aspirin if available and not allergic', 'Start CPR if unconscious and not breathing'], color: 'var(--color-emergency)' },
  { icon: <Zap size={24} />, title: 'Electric Shock', steps: ['Do NOT touch the person', 'Cut power source if possible', 'Call 108', 'Start CPR if needed once safe'], color: 'var(--color-warning)' },
  { icon: <Flame size={24} />, title: 'Burns', steps: ['Cool with running water for 20 min', 'Do NOT apply ice or butter', 'Cover loosely with clean cloth', 'Call 108 for severe burns'], color: '#F97316' },
  { icon: <Droplets size={24} />, title: 'Severe Bleeding', steps: ['Apply firm pressure with clean cloth', 'Elevate injured area above heart', 'Do NOT remove embedded objects', 'Call 108 if bleeding won\'t stop'], color: 'var(--color-emergency)' },
  { icon: <Bug size={24} />, title: 'Snake Bite', steps: ['Keep patient still and calm', 'Do NOT suck the venom', 'Remove jewelry near bite', 'Rush to hospital — anti-venom is the only cure'], color: 'var(--color-success)' },
  { icon: <AlertTriangle size={24} />, title: 'Poisoning', steps: ['Call 108 immediately', 'Do NOT induce vomiting', 'Save the poison container', 'Note the time of ingestion'], color: 'var(--color-warning)' },
];

export default function EmergencyCarePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0B1120 0%, #1A0A0A 100%)', color: 'var(--color-text-inverse)' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: '1.25rem clamp(1.5rem, 5vw, 4rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} /> {t('common.back')}
        </button>
        <div className="flex items-center gap-2">
          <Shield size={18} color="var(--color-emergency)" />
          <span className="text-label" style={{ color: 'var(--color-emergency)', fontSize: '0.7rem' }}>{t('emergency.title')}</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem)' }}>
        {/* Emergency Call */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="text-display-md" style={{ marginBottom: '0.75rem' }}>{t('emergency.needHelp')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>{t('emergency.call108Desc')}</p>

          <motion.a
            href={EMERGENCY_NUMBER_TEL}
            animate={{ boxShadow: ['0 0 30px rgba(185,28,28,0.3)', '0 0 60px rgba(185,28,28,0.5)', '0 0 30px rgba(185,28,28,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="btn-emergency no-underline"
            style={{ display: 'flex', width: '100%', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}
          >
            <Phone size={24} /> {t('emergency.call108')}
          </motion.a>

          <Link to="/nearby-hospitals" className="btn-secondary no-underline" style={{ width: '100%', display: 'flex', justifyContent: 'center', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
            <MapPin size={18} /> {t('hospital.findNearest')}
          </Link>
        </div>

        {/* First Aid Guides */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <h2 className="text-display-sm" style={{ marginBottom: '1.25rem' }}>{t('emergency.firstAidGuide')}</h2>
          <div className="flex flex-col gap-3">
            {FIRST_AID_GUIDES.map((guide) => (
              <FirstAidCard key={guide.title} {...guide} />
            ))}
          </div>
        </motion.div>

        {/* Helplines */}
        <div style={{ marginTop: '2rem', padding: '1.25rem', borderRadius: 'var(--radius-xl)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-label" style={{ color: 'var(--color-teal-400)', fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>{t('emergency.helplines')}</span>
          {[
            { label: 'Emergency Ambulance', number: '108' },
            { label: 'Women Helpline', number: '181' },
            { label: 'Child Helpline', number: '1098' },
            { label: 'Mental Health (NIMHANS)', number: '080-46110007' },
            { label: 'Poison Control', number: '1066' },
          ].map((line) => (
            <a key={line.number} href={`tel:${line.number}`} className="flex items-center justify-between" style={{ padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'inherit', textDecoration: 'none' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{line.label}</span>
              <span className="flex items-center gap-1" style={{ color: 'var(--color-teal-400)', fontWeight: 600, fontSize: '0.9rem' }}><Phone size={14} /> {line.number}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function FirstAidCard({ icon, title, steps, color }: { icon: React.ReactNode; title: string; steps: string[]; color: string }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      className="glass"
      style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-3" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
        <span style={{ fontWeight: 600, fontSize: '1rem', flex: 1 }}>{title}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} style={{ padding: '0 1.25rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.75rem' }}>
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                <span style={{ color, fontWeight: 700, flexShrink: 0, fontSize: '0.8rem', marginTop: '2px' }}>{i + 1}.</span> {step}
              </li>
            ))}
          </ol>
        </motion.div>
      )}
    </motion.div>
  );
}
