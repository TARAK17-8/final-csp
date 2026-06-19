// ═══════════════════════════════════════════════════════════════
// samaramAI — i18n Lazy Loader & Cache Manager
// Only English is bundled. Other languages loaded on demand.
// ═══════════════════════════════════════════════════════════════

import type { TranslationKeys } from './types';
import type { SupportedLanguage } from '@/types/common';
import { SUPPORTED_LANGUAGES } from '@/types/common';
import api from '@/lib/api';
import en from './en';

// In-memory cache — loaded packs stay for the session
const cache = new Map<string, TranslationKeys>();
cache.set('en', en);

// localStorage cache key
const LS_KEY = 'samaramai_i18n_cache';
const LS_VERSION = '2';

/**
 * Load a language pack. Returns cached version if available,
 * otherwise lazy-imports the module.
 */
export async function loadLanguage(code: SupportedLanguage): Promise<TranslationKeys> {
  // 1. Check in-memory cache
  if (cache.has(code)) {
    return cache.get(code)!;
  }

  // 2. Check localStorage cache
  try {
    const stored = localStorage.getItem(`${LS_KEY}_${code}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed._v === LS_VERSION && parsed.data) {
        cache.set(code, parsed.data);
        return parsed.data;
      }
    }
  } catch {
    // localStorage unavailable or corrupt — continue to import
  }

  // 3. Dynamic import
  let translations: TranslationKeys;
  try {
    const module = await getLanguageModule(code);
    translations = module.default;
  } catch {
    // 4. If language file doesn't exist, use Groq AI to translate it on the fly!
    console.log(`[i18n] Local file for "${code}" not found. Requesting dynamic Groq AI translation...`);
    try {
      const targetLangName = SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name || code;
      const response = await api.post('/translate/ui', {
        targetLanguageName: targetLangName,
        sourceKeys: en,
      });
      
      if (response.data.success && response.data.data) {
        translations = response.data.data;
      } else {
        throw new Error('Translation API returned failure');
      }
    } catch (apiError) {
      console.warn(`[i18n] Dynamic translation failed for "${code}", falling back to English.`, apiError);
      return en;
    }
  }

  // 5. Cache in memory
  cache.set(code, translations);

  // 5. Cache in localStorage
  try {
    localStorage.setItem(
      `${LS_KEY}_${code}`,
      JSON.stringify({ _v: LS_VERSION, data: translations })
    );
  } catch {
    // localStorage full or unavailable — ignore
  }

  return translations;
}

/**
 * Dynamic import router for all translated languages.
 * Languages without a dedicated file fall back to English.
 */
async function getLanguageModule(code: SupportedLanguage): Promise<{ default: TranslationKeys }> {
  switch (code) {
    case 'te': return import('./te');
    case 'hi': return import('./hi');
    case 'kn': return import('./kn');
    case 'ta': return import('./ta');
    case 'ml': return import('./ml');
    default:
      // Throw an error to trigger the dynamic API translation fallback
      throw new Error(`Static file for language code ${code} not found`);
  }
}

/**
 * Translate a key with optional interpolation.
 * Falls back: current language → English → raw key.
 *
 * Interpolation: t('onboarding.stepOf', { current: 3, total: 7 })
 * Template: "Step {{current}} of {{total}}" → "Step 3 of 7"
 */
export function translate(
  translations: TranslationKeys,
  key: keyof TranslationKeys,
  params?: Record<string, string | number>
): string {
  let text = translations[key] || en[key] || key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    }
  }

  return text;
}

/** Get the English fallback for a key */
export function getEnglishFallback(key: keyof TranslationKeys): string {
  return en[key] || key;
}

export { en };
export type { TranslationKeys };
