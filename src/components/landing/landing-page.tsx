import { FeaturesBento } from "@/components/landing/features-bento";
import { FinalCTA } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { Personas } from "@/components/landing/personas";

export function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturesBento />
      <Personas />
      <FinalCTA />
    </>
  );
}
