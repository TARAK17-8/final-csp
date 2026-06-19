// ═══════════════════════════════════════════════════════════════
// samaramAI — Progressive Onboarding Flow (7 Steps)
// One screen per step. Never multiple fields simultaneously.
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mic, Check } from 'lucide-react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { slideFromRight } from '@/lib/animations';
import { CHRONIC_CONDITIONS, KNOWN_ALLERGIES } from '@/lib/constants';
import { SUPPORTED_LANGUAGES } from '@/types/common';
import api from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';

// ── Step wrapper ──
function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={slideFromRight}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Chip Selector ──
function ChipSelector({ options, selected, onToggle }: {
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" style={{ marginTop: '1.5rem' }}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <motion.button
            key={opt}
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggle(opt)}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              border: `2px solid ${isSelected ? 'var(--color-teal-500)' : 'var(--color-surface)'}`,
              background: isSelected ? 'var(--color-teal-50)' : 'white',
              color: isSelected ? 'var(--color-teal-700)' : 'var(--color-text-secondary)',
              fontSize: '0.95rem',
              fontWeight: isSelected ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isSelected && <Check size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />}
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { currentStep, totalSteps, data, nextStep, prevStep, updateData } = useOnboardingStore();
  const { updateUser } = useAuthStore();
  const { t } = useTranslation();

  const progress = (currentStep / totalSteps) * 100;

  const handleComplete = async () => {
    try {
      await api.post('/onboarding', data);
      updateUser({ isOnboarded: true });
      navigate('/dashboard');
    } catch {
      // Save locally if offline
      updateUser({ isOnboarded: true });
      navigate('/dashboard');
    }
  };

  const toggleChip = (list: string[], item: string): string[] => {
    if (item === 'None of these' || item === 'No known allergies') return [item];
    const filtered = list.filter((i) => i !== 'None of these' && i !== 'No known allergies');
    return filtered.includes(item) ? filtered.filter((i) => i !== item) : [...filtered, item];
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-cream)', display: 'flex', flexDirection: 'column' }}>
      {/* Progress bar */}
      <div style={{ padding: '1.5rem clamp(1.5rem, 5vw, 4rem) 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          {currentStep > 1 && (
            <button onClick={prevStep} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
              <ArrowLeft size={18} /> {t('common.back')}
            </button>
          )}
          <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div style={{ height: '4px', borderRadius: '2px', background: 'var(--color-surface)' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, var(--color-teal-500), var(--color-teal-400))' }}
          />
        </div>
      </div>

      {/* Steps */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: 'clamp(1.5rem, 4vw, 3rem)' }}>
        <AnimatePresence mode="wait">
          {/* Step 1 — Age */}
          {currentStep === 1 && (
            <StepCard key="age">
              <h2 className="text-display-md" style={{ marginBottom: '0.5rem' }}>{t('onboarding.ageTitle')}</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{t('onboarding.ageDesc')}</p>
              <div style={{ textAlign: 'center' }}>
                <motion.span
                  key={data.age}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem, 10vw, 6rem)', fontWeight: 700, color: 'var(--color-teal-500)', display: 'block', lineHeight: 1 }}
                >
                  {data.age}
                </motion.span>
                <div className="flex items-center justify-center gap-4" style={{ marginTop: '1.5rem' }}>
                  <button onClick={() => updateData({ age: Math.max(1, data.age - 1) })} style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--color-surface)', background: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>−</button>
                  <input
                    type="range" min={1} max={120} value={data.age}
                    onChange={(e) => updateData({ age: parseInt(e.target.value) })}
                    style={{ flex: 1, maxWidth: '250px', accentColor: 'var(--color-teal-500)' }}
                  />
                  <button onClick={() => updateData({ age: Math.min(120, data.age + 1) })} style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--color-surface)', background: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>+</button>
                </div>
              </div>
              <button onClick={nextStep} className="btn-primary" style={{ width: '100%', marginTop: '2.5rem' }}>{t('common.continue')} <ArrowRight size={16} /></button>
            </StepCard>
          )}

          {/* Step 2 — Biological Sex */}
          {currentStep === 2 && (
            <StepCard key="sex">
              <h2 className="text-display-md" style={{ marginBottom: '0.5rem' }}>{t('onboarding.sexTitle')}</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{t('onboarding.sexDesc')}</p>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {(['male', 'female', 'prefer_not_to_say'] as const).map((option) => {
                  const isSelected = data.biologicalSex === option;
                  const labels = { male: 'Male', female: 'Female', prefer_not_to_say: 'Prefer not to say' };
                  const emojis = { male: '♂', female: '♀', prefer_not_to_say: '○' };
                  return (
                    <motion.button
                      key={option}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => { updateData({ biologicalSex: option }); setTimeout(nextStep, 300); }}
                      style={{
                        padding: '1.5rem 1rem',
                        borderRadius: 'var(--radius-xl)',
                        border: `2px solid ${isSelected ? 'var(--color-teal-500)' : 'var(--color-surface)'}`,
                        background: isSelected ? 'var(--color-teal-50)' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>{emojis[option]}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--color-teal-700)' : 'var(--color-text-secondary)' }}>{labels[option]}</span>
                      {isSelected && <Check size={16} color="var(--color-teal-500)" style={{ display: 'block', margin: '0.5rem auto 0' }} />}
                    </motion.button>
                  );
                })}
              </div>
            </StepCard>
          )}

          {/* Step 3 — Chronic Conditions */}
          {currentStep === 3 && (
            <StepCard key="conditions">
              <h2 className="text-display-md" style={{ marginBottom: '0.5rem' }}>{t('onboarding.conditionsTitle')}</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>{t('onboarding.conditionsDesc')}</p>
              <ChipSelector options={CHRONIC_CONDITIONS} selected={data.chronicConditions} onToggle={(item) => updateData({ chronicConditions: toggleChip(data.chronicConditions, item) })} />
              <button onClick={nextStep} className="btn-primary" style={{ width: '100%', marginTop: '2.5rem' }}>{t('common.continue')} <ArrowRight size={16} /></button>
            </StepCard>
          )}

          {/* Step 4 — Allergies */}
          {currentStep === 4 && (
            <StepCard key="allergies">
              <h2 className="text-display-md" style={{ marginBottom: '0.5rem' }}>{t('onboarding.allergiesTitle')}</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>{t('onboarding.allergiesDesc')}</p>
              <ChipSelector options={KNOWN_ALLERGIES} selected={data.allergies} onToggle={(item) => updateData({ allergies: toggleChip(data.allergies, item) })} />
              <button onClick={nextStep} className="btn-primary" style={{ width: '100%', marginTop: '2.5rem' }}>
                {t('common.continue')} <ArrowRight size={16} />
              </button>
            </StepCard>
          )}

          {/* Step 5 — Medications */}
          {currentStep === 5 && (
            <StepCard key="medications">
              <h2 className="text-display-md" style={{ marginBottom: '0.5rem' }}>{t('onboarding.medicationsTitle')}</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{t('onboarding.medicationsDesc')}</p>
              <input
                type="text"
                placeholder="Search medicines or type a name..."
                className="input-field"
                style={{ marginBottom: '1rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                    updateData({ medications: [...data.medications, (e.target as HTMLInputElement).value] });
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              {data.medications.length > 0 && (
                <div className="flex flex-wrap gap-2" style={{ marginBottom: '1rem' }}>
                  {data.medications.map((med) => (
                    <span key={med} style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', background: 'var(--color-teal-50)', color: 'var(--color-teal-700)', fontSize: '0.85rem' }}>
                      {med} <button onClick={() => updateData({ medications: data.medications.filter((m) => m !== med) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-teal-500)', fontWeight: 700, marginLeft: '0.25rem' }}>×</button>
                    </span>
                  ))}
                </div>
              )}
              <button onClick={nextStep} className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                {data.medications.length === 0 ? t('common.skip') : t('common.continue')} <ArrowRight size={16} />
              </button>
            </StepCard>
          )}

          {/* Step 6 — Emergency Contact */}
          {currentStep === 6 && (
            <StepCard key="emergency">
              <h2 className="text-display-md" style={{ marginBottom: '0.5rem' }}>{t('onboarding.emergencyTitle')}</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{t('onboarding.emergencyDesc')}</p>
              <input type="text" placeholder="Contact name" className="input-field" style={{ marginBottom: '1rem' }} onChange={(e) => updateData({ emergencyContact: { name: e.target.value, phone: data.emergencyContact?.phone || '' } })} value={data.emergencyContact?.name || ''} />
              <input type="tel" placeholder="Phone number" className="input-field" style={{ marginBottom: '1rem' }} onChange={(e) => updateData({ emergencyContact: { name: data.emergencyContact?.name || '', phone: e.target.value } })} value={data.emergencyContact?.phone || ''} />
              <button onClick={nextStep} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>{t('common.continue')} <ArrowRight size={16} /></button>
              <button onClick={nextStep} style={{ width: '100%', marginTop: '0.75rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
                {t('common.skip')}
              </button>
            </StepCard>
          )}

          {/* Step 7 — Language */}
          {currentStep === 7 && (
            <StepCard key="language">
              <h2 className="text-display-md" style={{ marginBottom: '0.5rem' }}>{t('onboarding.languageTitle')}</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{t('onboarding.languageDesc')}</p>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = data.preferredLanguage === lang.code;
                  return (
                    <motion.button
                      key={lang.code}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => updateData({ preferredLanguage: lang.code })}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-xl)',
                        border: `2px solid ${isSelected ? 'var(--color-teal-500)' : 'var(--color-surface)'}`,
                        background: isSelected ? 'var(--color-teal-50)' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>{lang.nativeName}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{lang.name}</span>
                      {isSelected && <Check size={16} color="var(--color-teal-500)" style={{ display: 'block', margin: '0.5rem auto 0' }} />}
                    </motion.button>
                  );
                })}
              </div>
              <button onClick={handleComplete} className="btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
                {t('onboarding.complete')} ✓
              </button>
            </StepCard>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
