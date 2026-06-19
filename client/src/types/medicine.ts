// ═══════════════════════════════════════════════════════════════
// samaramAI — Medicine Scanner Type Definitions
// ═══════════════════════════════════════════════════════════════

export interface MedicineInfo {
  brandName: string;
  genericName: string;
  strength: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'other';
  manufacturer: string;
  expiryDate: string;
  batchNumber: string;
  storageInstructions: string;
  notMedicine?: boolean;
}

export interface MedicineDetails {
  identity: MedicineInfo;
  purpose: string;
  howToTake: string;
  sideEffects: {
    common: string[];
    serious: string[];
  };
  contraindications: string[];
  interactions: DrugInteraction[];
  expiryStatus: 'safe' | 'expiring_soon' | 'expired';
}

export interface DrugInteraction {
  medicationName: string;
  severity: 1 | 2 | 3 | 4 | 5;
  description: string;
  recommendation: string;
}

export interface ScanResult {
  extractedText: string;
  confidence: number;
  medicineInfo: MedicineInfo | null;
  details: MedicineDetails | null;
}
