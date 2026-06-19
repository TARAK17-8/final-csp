// ═══════════════════════════════════════════════════════════════
// samaramAI — Prescription Translator Type Definitions
// ═══════════════════════════════════════════════════════════════

export interface MedicineTableEntry {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  specialInstructions: string;
}

export interface PreservedElements {
  medicineNames: string[];
  dosages: string[];
  doctorName: string | null;
  hospitalName: string | null;
  dates: string[];
}

export interface PrescriptionTranslationResult {
  ocrText: string;
  cleanedText: string;
  translatedText: string;
  explanation: string;
  medicineTable: MedicineTableEntry[];
  generalInstructions: string | null;
  followUpNote: string | null;
  confidence: TranslationConfidence;
  confidenceScore: number;
  unclearSections: string[];
  detectedLanguage: string;
  preservedElements: PreservedElements;
  targetLanguage: string;
  safetyNotice: string;
}

export type TranslationConfidence = 'high' | 'medium' | 'low';

export interface TranslationHistoryItem {
  id: string;
  createdAt: string;
  language: string;
  ocrText: string;
  translatedText: string;
  explanation: string;
  medicineTable: MedicineTableEntry[];
  confidence: TranslationConfidence;
}
