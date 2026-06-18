export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 overflow-hidden">
      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-6">
        {children}
      </main>
    </div>
  );
}
