// ═══════════════════════════════════════════════════════════════
// samaramAI — Language Context Provider
// Single source of truth for the current language.
// ═══════════════════════════════════════════════════════════════

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { SupportedLanguage } from '@/types/common';
import { isRTLLanguage, SUPPORTED_LANGUAGES } from '@/types/common';
import { loadLanguage, translate, en } from '@/i18n';
import type { TranslationKeys, TranslationKey } from '@/i18n/types';

// ── Context shape ──
export interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (code: SupportedLanguage) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isRTL: boolean;
  isLoading: boolean;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: async () => {},
  t: (key) => key,
  isRTL: false,
  isLoading: false,
});

// ── localStorage key ──
const LS_LANG_KEY = 'samaramai_language';

/**
 * Detect initial language from available sources.
 * Priority: localStorage → navigator.language → 'en'
 */
function detectInitialLanguage(): SupportedLanguage {
  // 1. localStorage
  try {
    const stored = localStorage.getItem(LS_LANG_KEY);
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
      return stored as SupportedLanguage;
    }
  } catch { /* ignore */ }

  // 2. Browser language
  try {
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang && SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
      return browserLang as SupportedLanguage;
    }
  } catch { /* ignore */ }

  // 3. Fallback
  return 'en';
}

// ── Provider component ──
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(detectInitialLanguage);
  const [translations, setTranslations] = useState<TranslationKeys>(en);
  const [isLoading, setIsLoading] = useState(false);
  const isRTL = isRTLLanguage(language);

  // Load translations on mount and language change
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (language === 'en') {
        setTranslations(en);
        return;
      }

      setIsLoading(true);
      try {
        const pack = await loadLanguage(language);
        if (!cancelled) {
          setTranslations(pack);
        }
      } catch {
        if (!cancelled) {
          setTranslations(en);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [language]);

  // Update document dir and lang attributes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  // Set language — updates state, localStorage, and document
  const setLanguage = useCallback(async (code: SupportedLanguage) => {
    setLanguageState(code);

    // Persist to localStorage
    try {
      localStorage.setItem(LS_LANG_KEY, code);
    } catch { /* ignore */ }
  }, []);

  // Translation function
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      return translate(translations, key, params);
    },
    [translations]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}
