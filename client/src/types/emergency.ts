// ═══════════════════════════════════════════════════════════════
// samaramAI — Emergency Type Definitions
// ═══════════════════════════════════════════════════════════════

export interface EmergencyState {
  isActive: boolean;
  detectedPattern: string;
  patientInfo: string;
  firstAidSteps: string[];
  timestamp: string;
}

export interface NearbyHospital {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'emergency';
  latitude: number;
  longitude: number;
  distance: number;
  address: string;
  phone: string;
  rating: number;
  isOpen: boolean;
  isEmergency: boolean;
}

export interface EmergencyPattern {
  id: string;
  name: string;
  symptoms: string[];
  description: string;
  firstAid: string[];
  urgency: 'critical' | 'high';
}
