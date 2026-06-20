// ═══════════════════════════════════════════════════════════════
// samaramAI — App Root with React Router
// ═══════════════════════════════════════════════════════════════

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactLenis } from 'lenis/react';
import { useAuthStore } from '@/stores/authStore';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { useTranslation } from '@/hooks/useTranslation';

// Layout
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import VoiceAssistantOverlay from '@/components/shared/VoiceAssistantOverlay';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

// Pages
import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import SignupPage from '@/features/auth/SignupPage';
import OnboardingFlow from '@/features/onboarding/OnboardingFlow';
import SymptomCheckerPage from '@/features/symptom-checker/SymptomCheckerPage';
import MedicineScannerPage from '@/features/medicine-scanner/MedicineScannerPage';
import NearbyHospitalsPage from '@/features/nearby-hospitals/NearbyHospitalsPage';
import EmergencyCarePage from '@/features/emergency-care/EmergencyCarePage';
import HealthRecordsPage from '@/features/health-records/HealthRecordsPage';
import AIAssistantPage from '@/features/ai-assistant/AIAssistantPage';
import PrescriptionTranslatorPage from '@/features/prescription-translator/PrescriptionTranslatorPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

// Pages that should NOT show the global navbar/footer
const STANDALONE_ROUTES = ['/auth', '/onboarding', '/symptom-checker', '/medicine-scanner', '/emergency', '/nearby-hospitals', '/emergency-care', '/health-records', '/ai-assistant', '/prescription-translator'];

function AppContent() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Determine if current path is standalone
  const pathname = window.location.pathname;
  const isStandalone = STANDALONE_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <>
      {!isStandalone && <Navbar />}
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<OnboardingFlow />} />

        {/* Core Modules */}
        <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
        <Route path="/medicine-scanner" element={<MedicineScannerPage />} />

        {/* Additional Modules */}
        <Route path="/nearby-hospitals" element={<NearbyHospitalsPage />} />
        <Route path="/emergency-care" element={<EmergencyCarePage />} />
        <Route path="/health-records" element={<HealthRecordsPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/prescription-translator" element={<PrescriptionTranslatorPage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
      </Routes>
      <VoiceAssistantOverlay />
      {!isStandalone && <Footer />}
    </>
  );
}

function DashboardPlaceholder() {
  const { t } = useTranslation();
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-cream)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      paddingTop: '6rem',
    }}>
      <h1 className="text-display-lg" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        {t('dashboard.welcome')} <span style={{ color: 'var(--color-teal-500)' }}>{t('dashboard.welcomeTo')}</span>
      </h1>
      <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: '500px', marginBottom: '2rem' }}>
        {t('dashboard.comingPhase2')}
      </p>
      <div className="flex flex-row gap-3 justify-center" style={{ width: '100%', overflowX: 'auto', paddingBottom: '1rem' }}>
        <a href="/symptom-checker" className="btn-primary no-underline whitespace-nowrap">{t('dashboard.checkSymptoms')}</a>
        <a href="/medicine-scanner" className="btn-secondary no-underline whitespace-nowrap">{t('dashboard.scanMedicine')}</a>
        <a href="/prescription-translator" className="btn-secondary no-underline whitespace-nowrap">{t('dashboard.prescriptionTranslator')}</a>
        <a href="/nearby-hospitals" className="btn-secondary no-underline whitespace-nowrap">{t('dashboard.nearbyHospitals')}</a>
        <a href="/emergency-care" className="btn-secondary no-underline whitespace-nowrap">{t('dashboard.emergencyCare')}</a>
        <a href="/health-records" className="btn-secondary no-underline whitespace-nowrap">{t('dashboard.healthRecords')}</a>
        <a href="/ai-assistant" className="btn-secondary no-underline whitespace-nowrap">{t('dashboard.aiAssistant')}</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ReactLenis root options={{ lerp: 0.07, duration: 1.4, smoothWheel: true }}>
          <ErrorBoundary>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </ErrorBoundary>
        </ReactLenis>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
