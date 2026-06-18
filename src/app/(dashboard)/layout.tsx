import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopBar } from "@/components/dashboard/top-bar";
import { FcmRegistration } from "@/features/notifications/components/fcm-registration";
import { getOsPermissions } from "@/features/os/actions/permissions.actions";
import { OsPermissionsProvider } from "@/features/os/components/os-permissions-provider";
import { GoalsDialogProvider } from "@/features/goals/components/goals-dialog-provider";
import { VaultDialogProvider } from "@/features/vault/components/vault-dialog-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const permissions = await getOsPermissions();

  return (
    <OsPermissionsProvider permissions={permissions}>
      <GoalsDialogProvider>
        <VaultDialogProvider>
          <FcmRegistration />
          <div className="flex h-screen overflow-hidden bg-background">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <DashboardTopBar />
              <DashboardShell>{children}</DashboardShell>
            </div>
          </div>
        </VaultDialogProvider>
      </GoalsDialogProvider>
    </OsPermissionsProvider>
  );
}
