// ═══════════════════════════════════════════════════════════════
// samaramAI — Auth Store (Zustand)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import type { User, FamilyProfile } from '@/types/common';

interface AuthStore {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeProfileId: string | null;

  // Actions
  initialize: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveProfile: (profileId: string) => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: true,
  activeProfileId: null,

  initialize: () => {
    console.log('[AuthStore] Initializing Firebase Auth listener');
    onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(`[AuthStore] Auth state changed. User: ${firebaseUser ? firebaseUser.uid : 'null'}`);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            set({
              firebaseUser,
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              activeProfileId: userData.activeProfileId || userData.uid,
            });
          } else {
            // New user — hasn't completed onboarding
            set({
              firebaseUser,
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || undefined,
                isOnboarded: false,
                preferredLanguage: 'en',
                voicePreferences: { speed: 1, isMuted: false, continuousMode: false },
                createdAt: new Date().toISOString(),
                profiles: [],
                activeProfileId: firebaseUser.uid,
              },
              isAuthenticated: true,
              isLoading: false,
              activeProfileId: firebaseUser.uid,
            });
          }
        } catch (err) {
          console.error('[AuthStore] Firestore profile fetch failed:', err);
          console.warn('[AuthStore] User is authenticated with Firebase, but Firestore profile is missing or permission denied. Check if Firestore is enabled.');
          set({ firebaseUser, isAuthenticated: true, isLoading: false });
        }
      } else {
        set({
          user: null,
          firebaseUser: null,
          isAuthenticated: false,
          isLoading: false,
          activeProfileId: null,
        });
      }
    });
  },

  loginWithEmail: async (email, password) => {
    console.log(`[AuthStore] Attempting login for email: ${email}`);
    set({ isLoading: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('[AuthStore] Login successful');
    } catch (err) {
      console.error('[AuthStore] Login failed:', err);
      set({ isLoading: false });
      throw err;
    }
  },

  loginWithGoogle: async () => {
    console.log('[AuthStore] Attempting Google login');
    set({ isLoading: true });
    try {
      await signInWithPopup(auth, googleProvider);
      console.log('[AuthStore] Google login successful');
    } catch (err) {
      console.error('[AuthStore] Google login failed:', err);
      set({ isLoading: false });
      throw err;
    }
  },

  signup: async (email, password, fullName) => {
    console.log(`[AuthStore] Attempting signup for email: ${email}`);
    set({ isLoading: true });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      console.log(`[AuthStore] Signup successful for: ${cred.user.uid}`);
      
      const newUser: User = {
        uid: cred.user.uid,
        email,
        displayName: fullName,
        isOnboarded: false,
        preferredLanguage: 'en',
        voicePreferences: { speed: 1, isMuted: false, continuousMode: false },
        createdAt: new Date().toISOString(),
        profiles: [],
        activeProfileId: cred.user.uid,
      };

      try {
        await setDoc(doc(db, 'users', cred.user.uid), newUser);
        console.log('[AuthStore] User profile created in Firestore');
      } catch (firestoreErr) {
        console.error('[AuthStore] Failed to create user profile in Firestore:', firestoreErr);
        console.warn('[AuthStore] Auth succeeded but Firestore write failed. Is Firestore enabled in the console?');
        // Do not throw here so the user remains authenticated
      }
    } catch (err) {
      console.error('[AuthStore] Signup failed:', err);
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    console.log('[AuthStore] Logging out');
    await signOut(auth);
    set({
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      activeProfileId: null,
    });
  },

  setActiveProfile: (profileId) => {
    set({ activeProfileId: profileId });
  },

  updateUser: (data) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...data } });
    }
  },
}));
