// ═══════════════════════════════════════════════════════════════
// samaramAI — Login Page
// ═══════════════════════════════════════════════════════════════

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Fingerprint } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { mapAuthCodeToMessage } from '@/lib/firebaseErrors';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle } = useAuthStore();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Email login error:", err);
      setError(err.code ? mapAuthCodeToMessage(err.code) : (err.message || t('common.error')));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.code ? mapAuthCodeToMessage(err.code) : (err.message || t('common.error')));
    }
  };

  return (
    <AuthLayout title={t('auth.welcomeBack')} subtitle={t('auth.signInSubtext')}>
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
          <Mail size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email')}
            required
            autoComplete="email"
            className="input-field"
            style={{ paddingLeft: '3rem' }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '0.75rem', position: 'relative' }}>
          <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.password')}
            required
            autoComplete="current-password"
            className="input-field"
            style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)',
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Forgot Password */}
        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <Link to="/auth/forgot-password" style={{ color: 'var(--color-teal-500)', fontSize: '0.9rem', textDecoration: 'none' }}>
            {t('auth.forgotPassword')}
          </Link>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'var(--color-emergency-light)', color: 'var(--color-emergency)',
              fontSize: '0.9rem', marginBottom: '1rem',
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', marginBottom: '1rem', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? t('auth.signingIn') : t('auth.signInButton')}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-surface)' }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{t('common.or')}</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-surface)' }} />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          className="btn-secondary"
          style={{ width: '100%', marginBottom: '0.75rem', borderColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          {t('auth.orContinueWith')} {t('auth.google')}
        </button>



        {/* Signup link */}
        <p style={{ textAlign: 'center', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
          {t('auth.noAccount')}{' '}
          <Link to="/auth/signup" style={{ color: 'var(--color-teal-500)', fontWeight: 600, textDecoration: 'none' }}>
            {t('auth.createAccount')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
