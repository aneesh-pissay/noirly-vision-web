import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Noirly Vision handles your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How Noirly Vision handles your information."
    >
      <LegalSection title="1. Overview">
        <p>
          Noirly Vision is a personal operating system for organizing your
          vision, goals, daily actions, focus sessions, and knowledge. This
          policy explains what we store and how we use it in this early version
          of the product.
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Store">
        <p>When you use Noirly Vision, we may store:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Account information such as your name and email</li>
          <li>Visions and goals you create</li>
          <li>Actions, milestones, and action plans</li>
          <li>Focus session history</li>
          <li>Knowledge entries</li>
          <li>Preferences and workspace settings</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How Data Is Used">
        <p>Your data is used only to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide the Noirly Vision application experience</li>
          <li>Help you track personal progress across your workspace</li>
          <li>Keep your workspace in sync when you sign in</li>
          <li>Maintain reliability and improve the product over time</li>
        </ul>
        <p>
          We do not sell your personal content. Data is used to run the service
          you signed up for.
        </p>
      </LegalSection>

      <LegalSection title="4. Data Ownership">
        <p>
          You own the personal content you create in Noirly Vision, including
          your visions, goals, actions, focus records, and knowledge entries. We
          store this content so the product can work for you.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Security">
        <p>
          We use reasonable security practices to protect stored account and
          workspace data. No online service can guarantee perfect security, but
          we work to keep your information protected as the product grows.
        </p>
      </LegalSection>

      <LegalSection title="6. Export and Deletion">
        <p>
          You can export your workspace data as a JSON backup from Settings at
          any time. You can also delete workspace data or your full account from
          Settings when you no longer want your information stored with us.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          Questions about privacy? Contact us at{" "}
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
