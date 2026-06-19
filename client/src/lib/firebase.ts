// ═══════════════════════════════════════════════════════════════
// samaramAI — Firebase Client Configuration
// ═══════════════════════════════════════════════════════════════

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate environment variables
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'measurementId') // measurementId is optional
  .map(([key]) => key);

if (missingKeys.length > 0) {
  const errMsg = `Missing required configuration keys: ${missingKeys.join(', ')}. Ensure your .env file is loaded.`;
  console.error(`[Firebase] ${errMsg}`);
  // We throw here so we don't send malformed requests to Firebase
  throw new Error(errMsg);
}

// Initialize Firebase
let app: ReturnType<typeof initializeApp>;
try {
  app = initializeApp(firebaseConfig);
  console.log(`[Firebase] App initialized successfully for project: ${firebaseConfig.projectId || 'unknown'}`);
} catch (error) {
  console.error('[Firebase] Failed to initialize App:', error);
  throw error;
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId ? getAnalytics(app) : null;

export default app;
