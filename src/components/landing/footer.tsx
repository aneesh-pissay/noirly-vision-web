import Link from "next/link";
import { BrandLogo } from "@/components/landing/brand-logo";

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-md">
          <BrandLogo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A personal OS for defining vision, executing daily, and learning
            continuously.
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Noirly Vision. All rights
            reserved.
          </p>
        </div>

        <nav className="flex items-center gap-8">
          {legalLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
