// ═══════════════════════════════════════════════════════════════
// samaramAI — Signup Page (3-step progressive)
// ═══════════════════════════════════════════════════════════════

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { useAuthStore } from '@/stores/authStore';
import { slideFromRight } from '@/lib/animations';
import { useTranslation } from '@/hooks/useTranslation';
import { mapAuthCodeToMessage } from '@/lib/firebaseErrors';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuthStore();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      setError(t('auth.fullName'));
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2 = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError(t('auth.invalidEmail'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.weakPassword'));
      return;
    }
    setError('');
    setStep(3);
    handleSignup();
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      await signup(email, password, fullName);
      // After signup, redirect to onboarding
      setTimeout(() => navigate('/onboarding'), 1500);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.code ? mapAuthCodeToMessage(err.code) : (err.message || t('auth.emailInUse')));
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate('/onboarding');
    } catch (err: any) {
      console.error("Google signup error:", err);
      setError(err.code ? mapAuthCodeToMessage(err.code) : (err.message || t('common.error')));
    }
  };

  return (
    <AuthLayout title={t('auth.createAccountTitle')} subtitle={t('auth.createAccountSubtext')}>
      {/* Progress indicator */}
      <div className="flex gap-2" style={{ marginBottom: '2rem' }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              flex: 1, height: '4px', borderRadius: '2px',
              background: s <= step ? 'var(--color-teal-500)' : 'var(--color-surface)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form key="step1" variants={slideFromRight} initial="hidden" animate="visible" exit="exit" onSubmit={handleStep1}>
            <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
              <User size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('auth.fullName')}
                required
                autoComplete="name"
                autoFocus
                className="input-field"
                style={{ paddingLeft: '3rem' }}
              />
            </div>

            {error && (
              <p style={{ color: 'var(--color-emergency)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
              {t('common.continue')} →
            </button>

            <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-surface)' }} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{t('common.or')}</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-surface)' }} />
            </div>

            <button type="button" onClick={handleGoogle} className="btn-secondary" style={{ width: '100%', marginBottom: '1.5rem', borderColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {t('common.signUp')} with {t('auth.google')}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
              {t('auth.haveAccount')}{' '}
              <Link to="/auth/login" style={{ color: 'var(--color-teal-500)', fontWeight: 600, textDecoration: 'none' }}>{t('common.signIn')}</Link>
            </p>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form key="step2" variants={slideFromRight} initial="hidden" animate="visible" exit="exit" onSubmit={handleStep2}>
            <button type="button" onClick={() => { setStep(1); setError(''); }} className="flex items-center gap-1" style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <ArrowLeft size={16} /> {t('common.back')}
            </button>

            <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
              <Mail size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} required autoComplete="email" autoFocus className="input-field" style={{ paddingLeft: '3rem' }} />
            </div>

            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password')} required autoComplete="new-password" className="input-field" style={{ paddingLeft: '3rem', paddingRight: '3rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p style={{ color: 'var(--color-emergency)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              {t('auth.signUpButton')} →
            </button>
          </motion.form>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={slideFromRight} initial="hidden" animate="visible" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--color-success-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <motion.svg
                width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <motion.path d="M20 6L9 17L4 12" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
              </motion.svg>
            </motion.div>
            <h3 className="text-display-sm" style={{ marginBottom: '0.5rem' }}>{t('auth.accountCreated')}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              {loading ? t('common.loading') : t('common.loading')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
