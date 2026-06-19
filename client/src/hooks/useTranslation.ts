// ═══════════════════════════════════════════════════════════════
// samaramAI — useTranslation Hook
// ═══════════════════════════════════════════════════════════════

import { useContext } from 'react';
import { LanguageContext, type LanguageContextValue } from '@/contexts/LanguageProvider';

/**
 * Access the i18n system from any component.
 *
 * @example
 * const { t, language, setLanguage, isRTL } = useTranslation();
 * <h1>{t('hero.headline1')}</h1>
 * <button onClick={() => setLanguage('te')}>తెలుగు</button>
 */
export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a <LanguageProvider>');
  }
  return context;
}
