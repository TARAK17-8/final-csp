// ═══════════════════════════════════════════════════════════════
// samaramAI — TypeScript Type Definitions — Common Types
// ═══════════════════════════════════════════════════════════════

export interface VoicePreferences {
  speed: number;
  voiceURI?: string;
  isMuted: boolean;
  continuousMode: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  isOnboarded: boolean;
  preferredLanguage: SupportedLanguage;
  voicePreferences?: VoicePreferences;
  createdAt: string;
  profiles: FamilyProfile[];
  activeProfileId: string;
}

export interface FamilyProfile {
  id: string;
  name: string;
  relationship: 'self' | 'parent' | 'spouse' | 'child' | 'sibling' | 'other';
  age: number;
  biologicalSex: 'male' | 'female' | 'prefer_not_to_say';
  chronicConditions: string[];
  allergies: string[];
  medications: Medication[];
  emergencyContact?: EmergencyContact;
  avatarUrl?: string;
}

export interface Medication {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'other';
  frequency: string;
  startDate: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export type SupportedLanguage =
  | 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'ml'
  | 'bn' | 'mr' | 'gu' | 'pa' | 'ur'
  | 'es' | 'fr' | 'de' | 'ar' | 'zh' | 'ja' | 'ko';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  script: string;
  rtl: boolean;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  // ── Primary (fully translated) ──
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', rtl: false, flag: '🇬🇧' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', rtl: false, flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', rtl: false, flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', rtl: false, flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', rtl: false, flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', script: 'Devanagari', rtl: false, flag: '🇮🇳' },
  // ── Additional Indian ──
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', rtl: false, flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', rtl: false, flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', rtl: false, flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', rtl: false, flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Nastaliq', rtl: true, flag: '🇵🇰' },
  // ── International ──
  { code: 'es', name: 'Spanish', nativeName: 'Español', script: 'Latin', rtl: false, flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', script: 'Latin', rtl: false, flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', script: 'Latin', rtl: false, flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', script: 'Arabic', rtl: true, flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', script: 'Simplified Han', rtl: false, flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', script: 'Kanji/Kana', rtl: false, flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', script: 'Hangul', rtl: false, flag: '🇰🇷' },
];

/** Check if a language code uses right-to-left script */
export function isRTLLanguage(code: SupportedLanguage): boolean {
  return code === 'ar' || code === 'ur';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
