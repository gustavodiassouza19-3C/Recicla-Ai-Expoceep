"use client";

import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ImpactSection } from "@/components/landing/impact-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { EffectBand } from "@/components/landing/effect-band";

export default function Home() {
  return (
    <>
      <LandingHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <EffectBand>
          <HowItWorksSection />
          <FeaturesSection />
        </EffectBand>
        <ImpactSection />
        <FaqSection />
        <CtaSection />
      </main>
    </>
  );
}
