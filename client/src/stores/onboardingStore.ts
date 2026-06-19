// ═══════════════════════════════════════════════════════════════
// samaramAI — Onboarding Store (Zustand)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { OnboardingData } from '@/types/auth';

interface OnboardingStore {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  isComplete: boolean;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  currentStep: 1,
  totalSteps: 7,
  data: {
    age: 30,
    biologicalSex: 'prefer_not_to_say',
    chronicConditions: [],
    allergies: [],
    medications: [],
    preferredLanguage: 'en',
  },
  isComplete: false,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },

  updateData: (partial) => {
    set((state) => ({
      data: { ...state.data, ...partial },
    }));
  },

  complete: () => set({ isComplete: true }),

  reset: () =>
    set({
      currentStep: 1,
      data: {
        age: 30,
        biologicalSex: 'prefer_not_to_say',
        chronicConditions: [],
        allergies: [],
        medications: [],
        preferredLanguage: 'en',
      },
      isComplete: false,
    }),
}));
