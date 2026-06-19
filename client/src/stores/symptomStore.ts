// ═══════════════════════════════════════════════════════════════
// samaramAI — Symptom Checker Store (Zustand)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import type {
  BodyRegion,
  SeverityLevel,
  SymptomAnswer,
  SymptomAnalysis,
  SymptomQuestion,
} from '@/types/symptom';

interface SymptomStore {
  // Session state
  sessionId: string;
  selectedRegion: BodyRegion | null;
  conversationHistory: SymptomAnswer[];
  currentQuestion: SymptomQuestion | null;
  severity: SeverityLevel | null;
  currentStep: 'region' | 'questions' | 'severity' | 'confirmation' | 'analyzing' | 'results' | 'emergency';
  analysis: SymptomAnalysis | null;
  isLoading: boolean;

  // Actions
  selectRegion: (region: BodyRegion) => void;
  addAnswer: (answer: SymptomAnswer) => void;
  setCurrentQuestion: (question: SymptomQuestion | null) => void;
  setSeverity: (severity: SeverityLevel) => void;
  setStep: (step: SymptomStore['currentStep']) => void;
  setAnalysis: (analysis: SymptomAnalysis) => void;
  setLoading: (loading: boolean) => void;
  goBack: () => void;
  reset: () => void;
}

const generateSessionId = (): string =>
  `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const useSymptomStore = create<SymptomStore>((set, get) => ({
  sessionId: generateSessionId(),
  selectedRegion: null,
  conversationHistory: [],
  currentQuestion: null,
  severity: null,
  currentStep: 'region',
  analysis: null,
  isLoading: false,

  selectRegion: (region) => {
    set({ selectedRegion: region, currentStep: 'questions' });
  },

  addAnswer: (answer) => {
    set((state) => ({
      conversationHistory: [...state.conversationHistory, answer],
    }));
  },

  setCurrentQuestion: (question) => {
    set({ currentQuestion: question });
  },

  setSeverity: (severity) => {
    set({ severity, currentStep: 'confirmation' });
  },

  setStep: (step) => {
    set({ currentStep: step });
  },

  setAnalysis: (analysis) => {
    if (analysis.isEmergency) {
      set({ analysis, currentStep: 'emergency' });
    } else {
      set({ analysis, currentStep: 'results' });
    }
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  goBack: () => {
    const { currentStep, conversationHistory } = get();
    switch (currentStep) {
      case 'questions':
        if (conversationHistory.length > 0) {
          set({
            conversationHistory: conversationHistory.slice(0, -1),
          });
        } else {
          set({ currentStep: 'region', selectedRegion: null });
        }
        break;
      case 'severity':
        set({ currentStep: 'questions' });
        break;
      case 'confirmation':
        set({ currentStep: 'severity', severity: null });
        break;
      case 'results':
        set({ currentStep: 'confirmation', analysis: null });
        break;
      default:
        break;
    }
  },

  reset: () => {
    set({
      sessionId: generateSessionId(),
      selectedRegion: null,
      conversationHistory: [],
      currentQuestion: null,
      severity: null,
      currentStep: 'region',
      analysis: null,
      isLoading: false,
    });
  },
}));
