import Link from "next/link";
import { LogoMark } from "@/components/layout/logo";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 font-semibold tracking-tight", className)}
      aria-label={APP_NAME}
    >
      <LogoMark size={32} priority />
      <span className="text-lg text-foreground">
        Noirly <span className="text-primary">Vision</span>
      </span>
    </Link>
  );
}
