// ═══════════════════════════════════════════════════════════════
// samaramAI — Application Constants
// ═══════════════════════════════════════════════════════════════

import type { TranslationKey } from '@/i18n/types';

export const APP_NAME = 'samaramAI';
export const APP_TAGLINE = 'Healthcare guidance and protection for every family, in every language.';

export const EMERGENCY_NUMBER = '108';
export const EMERGENCY_NUMBER_TEL = 'tel:108';

export const CHRONIC_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Heart Disease',
  'Thyroid',
  'Kidney Disease',
  'COPD',
  'None of these',
];

export const KNOWN_ALLERGIES = [
  'Penicillin',
  'Sulfa drugs',
  'Aspirin',
  'NSAIDs',
  'Latex',
  'Shellfish',
  'No known allergies',
];

export const NAV_LINKS: { labelKey: TranslationKey; href: string }[] = [
  { labelKey: 'nav.features', href: '#features' },
  { labelKey: 'nav.safety', href: '#safety' },
  { labelKey: 'nav.languages', href: '#languages' },
  { labelKey: 'nav.emergency', href: '/emergency-care' },
];

export const FEATURE_STRIP_ITEMS: { icon: string; labelKey: TranslationKey; href: string }[] = [
  { icon: 'activity', labelKey: 'hero.stripSymptomChecker', href: '/symptom-checker' },
  { icon: 'map-pin', labelKey: 'hero.stripNearbyHospitals', href: '/nearby-hospitals' },
  { icon: 'languages', labelKey: 'hero.stripPrescriptionTranslator', href: '/prescription-translator' },
  { icon: 'scan', labelKey: 'hero.stripMedicineScan', href: '/medicine-scanner' },
  { icon: 'bot', labelKey: 'hero.stripAIAssistant', href: '/ai-assistant' },
  { icon: 'shield', labelKey: 'hero.stripEmergencyCare', href: '/emergency-care' },
  { icon: 'file-heart', labelKey: 'hero.stripHealthRecords', href: '/health-records' },
];
