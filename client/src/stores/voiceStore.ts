// ═══════════════════════════════════════════════════════════════
// samaramAI — Voice Store (Zustand)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'submitted' | 'speaking' | 'ai_speaking' | 'error';

interface VoiceStore {
  state: VoiceState;
  transcript: string;
  interimTranscript: string;
  isContinuousMode: boolean;
  isMuted: boolean;
  speed: number;
  voiceURI?: string;
  errorMessage?: string;

  // Actions
  setState: (state: VoiceState, errorMessage?: string) => void;
  setTranscript: (text: string) => void;
  setInterimTranscript: (text: string) => void;
  appendTranscript: (text: string) => void;
  clearTranscript: () => void;
  setPreferences: (prefs: { isContinuousMode?: boolean; isMuted?: boolean; speed?: number; voiceURI?: string }) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  state: 'idle',
  transcript: '',
  interimTranscript: '',
  isContinuousMode: false,
  isMuted: false,
  speed: 1,
  voiceURI: undefined,
  errorMessage: undefined,

  setState: (state, errorMessage) => set({ state, errorMessage: errorMessage || undefined }),
  
  setTranscript: (text) => set({ transcript: text }),
  
  setInterimTranscript: (text) => set({ interimTranscript: text }),
  
  appendTranscript: (text) => set((prev) => ({ 
    transcript: prev.transcript ? `${prev.transcript} ${text}` : text 
  })),
  
  clearTranscript: () => set({ transcript: '', interimTranscript: '' }),
  
  setPreferences: (prefs) => set((prev) => ({ ...prev, ...prefs })),
  
  reset: () => set({ 
    state: 'idle', 
    transcript: '', 
    interimTranscript: '',
    errorMessage: undefined 
  }),
}));
