// ═══════════════════════════════════════════════════════════════
// samaramAI — Custom Hooks
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

// ── useMediaQuery ──
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ── useIsMobile ──
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

// ── usePrefersReducedMotion (re-exported for convenience) ──
export { useReducedMotion };

// ── useGeolocation ──
interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation not supported', loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState((s) => ({ ...s, error: error.message, loading: false }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return state;
}

// ── useVoiceInput ──
interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

export function useVoiceInput(language: string = 'en-IN') {
  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
  });

  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);

  const createRecognition = useCallback(() => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new (SpeechRecognition as new () => any)();
    (recognition as unknown as Record<string, unknown>).lang = language;
    (recognition as unknown as Record<string, unknown>).continuous = false;
    (recognition as unknown as Record<string, unknown>).interimResults = true;
    return recognition;
  }, [language]);

  const startListening = useCallback(() => {
    if (!state.isSupported) return;
    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    (recognition as unknown as Record<string, (e: unknown) => void>).onresult = (event: unknown) => {
      const e = event as { results: { isFinal: boolean; 0: { transcript: string } }[] };
      let interim = '';
      let final = '';
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setState((s) => ({
        ...s,
        transcript: final || s.transcript,
        interimTranscript: interim,
      }));
    };

    (recognition as unknown as Record<string, () => void>).onend = () => {
      setState((s) => ({ ...s, isListening: false }));
    };

    (recognition as unknown as Record<string, (e: unknown) => void>).onerror = (event: unknown) => {
      const e = event as { error: string };
      setState((s) => ({ ...s, error: e.error, isListening: false }));
    };

    (recognition as unknown as { start: () => void }).start();
    setState((s) => ({ ...s, isListening: true, error: null }));
  }, [state.isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      (recognitionRef.current as unknown as { stop: () => void }).stop();
    }
    setState((s) => ({ ...s, isListening: false }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState((s) => ({ ...s, transcript: '', interimTranscript: '' }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
}

// ── useOnlineStatus ──
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ── useScrollDirection ──
export function useScrollDirection(): 'up' | 'down' {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handler = () => {
      const currentY = window.scrollY;
      setDirection(currentY > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return direction;
}
