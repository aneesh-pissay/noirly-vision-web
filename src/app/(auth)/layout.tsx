import { AuthBrand } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute inset-0 noirly-gradient" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8">
          <AuthBrand />
        </div>
        <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
