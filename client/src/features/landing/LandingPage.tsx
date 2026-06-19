// ═══════════════════════════════════════════════════════════════
// samaramAI — Landing Page Orchestrator
// Assembles all 11 sections with Lenis smooth scroll
// ═══════════════════════════════════════════════════════════════

import HeroSection from './HeroSection';
import WhySection from './WhySection';
import FeaturesShowcase from './FeaturesShowcase';
import {
  SeveritySection,
  MultilingualSection,
  OfflineSection,
  FamilyCareSection,
  TrustSection,
  TestimonialsSection,
  FinalCTASection,
} from './LandingSections';

export default function LandingPage() {
  return (
    <main>
      {/* Section 01 — Cinematic Hero */}
      <HeroSection />

      {/* Section 02 — Why samaramAI Exists */}
      <WhySection />

      {/* Sections 03 — Features Showcase (6 features) */}
      <FeaturesShowcase />

      {/* Section 05 — Emoji Severity System */}
      <SeveritySection />

      {/* Section 06 — Multilingual Showcase */}
      <MultilingualSection />

      {/* Section 07 — Offline First */}
      <OfflineSection />

      {/* Section 08 — Family Care */}
      <FamilyCareSection />

      {/* Section 09 — Trust & Safety */}
      <TrustSection />

      {/* Section 10 — Testimonials */}
      <TestimonialsSection />

      {/* Section 11 — Final CTA */}
      <FinalCTASection />
    </main>
  );
}
