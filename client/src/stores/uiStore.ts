// ═══════════════════════════════════════════════════════════════
// samaramAI — UI Store (Zustand)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';

interface UIStore {
  isMobileMenuOpen: boolean;
  isEmergencyActive: boolean;
  isOffline: boolean;
  scrollY: number;

  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setEmergencyActive: (active: boolean) => void;
  setOffline: (offline: boolean) => void;
  setScrollY: (y: number) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isEmergencyActive: false,
  isOffline: !navigator.onLine,
  scrollY: 0,

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  setEmergencyActive: (active) => set({ isEmergencyActive: active }),
  setOffline: (offline) => set({ isOffline: offline }),
  setScrollY: (y) => set({ scrollY: y }),
}));
