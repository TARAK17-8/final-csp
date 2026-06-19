// ═══════════════════════════════════════════════════════════════
// samaramAI — API Client (Axios)
// ═══════════════════════════════════════════════════════════════

import axios from 'axios';
import { auth } from './firebase';
import { SUPPORTED_LANGUAGES } from '@/types/common';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Firebase ID token and Target Language to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach language name for backend Groq AI Universal Translation
  try {
    const code = localStorage.getItem('samaramai_language');
    if (code) {
      const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
      if (lang) {
        config.headers['x-target-language-name'] = lang.name;
      }
    }
  } catch { /* ignore */ }

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — Firebase SDK will auto-refresh
      console.warn('Auth token expired, refreshing...');
    }
    return Promise.reject(error);
  }
);

export default api;
