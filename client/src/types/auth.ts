// ═══════════════════════════════════════════════════════════════
// samaramAI — Auth Type Definitions
// ═══════════════════════════════════════════════════════════════

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface OnboardingData {
  age: number;
  biologicalSex: 'male' | 'female' | 'prefer_not_to_say';
  chronicConditions: string[];
  allergies: string[];
  medications: string[];
  emergencyContact?: {
    name: string;
    phone: string;
  };
  preferredLanguage: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: import('./common').User | null;
  token: string | null;
}
