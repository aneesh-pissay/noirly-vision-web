import { VaultWorkspace } from "@/features/vault/components/vault-workspace";
import { getVaultPageData } from "@/features/vault/actions/vault.actions";

export default async function VaultPage() {
  const data = await getVaultPageData();

  return <VaultWorkspace data={data} />;
}
