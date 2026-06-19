import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Rules for using Noirly Vision.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="Rules for using Noirly Vision."
    >
      <LegalSection title="1. Acceptance">
        <p>
          By creating an account or using Noirly Vision, you agree to these
          terms. If you do not agree, please do not use the product.
        </p>
      </LegalSection>

      <LegalSection title="2. Product Description">
        <p>
          Noirly Vision helps you manage your personal operating system,
          including:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Personal vision and long-term direction</li>
          <li>Goals and milestones</li>
          <li>Daily actions and task planning</li>
          <li>Focus sessions for deep work</li>
          <li>Knowledge captured in your library</li>
        </ul>
        <p>
          Features may change as Noirly Vision evolves during early release.
        </p>
      </LegalSection>

      <LegalSection title="3. User Responsibility">
        <p>You are responsible for:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Your account and the activity under it</li>
          <li>The content you create in your workspace</li>
          <li>How you use Noirly Vision in your personal or professional life</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Account Access">
        <p>
          Keep your login credentials secure. You are responsible for activity
          that happens through your account. Let us know if you believe your
          account has been accessed without permission.
        </p>
      </LegalSection>

      <LegalSection title="5. Service Changes">
        <p>
          Noirly Vision is an early product and may change over time. We may
          add, update, or remove features to improve the experience. We will try
          to make meaningful changes clear when they affect how you use the
          product.
        </p>
      </LegalSection>

      <LegalSection title="6. Limitations">
        <p>
          Noirly Vision provides productivity tools to help you organize and
          carry out your work. It does not guarantee specific personal, career, or
          financial results. You use the product at your own discretion.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          Questions about these terms? Contact us at{" "}
          <a
            href="mailto:aneeshpissay330@gmail.com"
            className="text-primary transition-colors hover:text-primary/80"
          >
            aneeshpissay330@gmail.com
          </a>
          . This address is a placeholder while Noirly Vision is in early
          release.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
