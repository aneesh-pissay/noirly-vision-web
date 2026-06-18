import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const LOGO_SRC = "/logo.png";

interface LogoMarkProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

export function LogoMark({
  className,
  size = 32,
  priority = false,
}: LogoMarkProps) {
  return (
    // Native img preserves PNG alpha; next/image can flatten transparency.
    <img
      src={LOGO_SRC}
      alt={APP_NAME}
      width={size}
      height={size}
      fetchPriority={priority ? "high" : undefined}
      className={cn("shrink-0 bg-transparent object-contain", className)}
      style={{ width: size, height: size }}
      decoding="async"
    />
  );
}

interface LogoProps {
  collapsed?: boolean;
  showSubtitle?: boolean;
  className?: string;
  href?: string;
}

export function Logo({
  collapsed = false,
  showSubtitle = false,
  className,
  href = "/dashboard",
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90",
        collapsed && "justify-center",
        className
      )}
      aria-label={APP_NAME}
    >
      <LogoMark size={32} priority />
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight tracking-tight text-foreground">
            Noirly <span className="text-primary">Vision</span>
          </p>
          {showSubtitle ? (
            <p className="truncate text-xs text-muted-foreground">{APP_TAGLINE}</p>
          ) : null}
        </div>
      )}
    </Link>
  );
}

export function AuthBrand({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <LogoMark size={32} priority />
      <div>
        <p className="text-lg font-semibold tracking-tight text-foreground">
          Noirly <span className="text-primary">Vision</span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{APP_TAGLINE}</p>
      </div>
    </div>
  );
}

export function BrandingLoader() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <LogoMark size={28} className="opacity-90" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}
