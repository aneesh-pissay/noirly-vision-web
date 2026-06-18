"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useOsPermissions } from "@/features/os/components/os-permissions-provider";

type VaultDialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  editingEntryId: string | null;
  openNewEntry: () => void;
  openEditEntry: (entryId: string) => void;
};

const VaultDialogContext = createContext<VaultDialogContextValue | null>(null);

export function VaultDialogProvider({ children }: { children: ReactNode }) {
  const { vault } = useOsPermissions();
  const [open, setOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      editingEntryId,
      openNewEntry: () => {
        if (!vault.unlocked) return;
        setEditingEntryId(null);
        setOpen(true);
      },
      openEditEntry: (entryId: string) => {
        setEditingEntryId(entryId);
        setOpen(true);
      },
    }),
    [open, editingEntryId, vault.unlocked]
  );

  return (
    <VaultDialogContext.Provider value={value}>
      {children}
    </VaultDialogContext.Provider>
  );
}

export function useVaultDialog() {
  const ctx = useContext(VaultDialogContext);
  if (!ctx) {
    throw new Error("useVaultDialog must be used within VaultDialogProvider");
  }
  return ctx;
}
