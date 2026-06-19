"use client";



import { useMemo, useState } from "react";

import { Plus } from "lucide-react";

import {

  VaultCollectionsPanel,

  type VaultCollectionFilter,

} from "@/features/vault/components/vault-collections-panel";

import { useVaultDialog } from "@/features/vault/components/vault-dialog-provider";

import { VaultEntrySheet } from "@/features/vault/components/vault-entry-sheet";

import { VaultKnowledgeFeed } from "@/features/vault/components/vault-knowledge-feed";

import { VaultKnowledgeGraph } from "@/features/vault/components/vault-knowledge-graph";

import { VaultLockedState } from "@/features/vault/components/vault-locked-state";

import type { VaultPageData } from "@/features/vault/types";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";



type VaultWorkspaceProps = {

  data: VaultPageData;

};



function displayStat(value: number, formatter?: (value: number) => string) {

  if (value <= 0) return "—";

  return formatter ? formatter(value) : String(value);

}



export function VaultWorkspace({ data }: VaultWorkspaceProps) {

  const { openNewEntry, openEditEntry } = useVaultDialog();

  const [activeFilter, setActiveFilter] =

    useState<VaultCollectionFilter>("all");

  const [selectedId, setSelectedId] = useState<string | null>(

    data.entries[0]?.id ?? null

  );



  const isUnlocked = data.lock.unlocked;



  const visibleEntries = useMemo(() => {

    if (activeFilter === "all") return data.entries;

    return data.entries.filter((entry) => entry.type === activeFilter);

  }, [activeFilter, data.entries]);



  const stats = [

    {

      label: "Total Entries",

      value: displayStat(data.stats.totalEntries),

      sub:

        data.stats.totalEntries > 0

          ? `${data.stats.tagCount} tag collections`

          : isUnlocked

            ? "Start capturing knowledge"

            : "Unlock after actions",

    },

    {

      label: "Knowledge Links",

      value: displayStat(data.stats.linkedEntries),

      sub:

        data.stats.totalEntries > 0

          ? `${data.stats.knowledgeAlignment}% alignment`

          : "Link entries to your system",

    },

    {

      label: "Learning Hours",

      value: "—",

      sub: "Tracked from focus sessions",

    },

    {

      label: "Growth Areas",

      value: displayStat(data.stats.tagCount),

      sub:

        data.stats.tagCount > 0

          ? "Active knowledge themes"

          : "Tags emerge as you write",

    },

  ];



  return (

    <div className="min-w-0 space-y-6 overflow-x-hidden pb-8">

      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="min-w-0">

          <h1 className="text-2xl font-semibold tracking-tight">Knowledge</h1>

          <p className="mt-1 text-sm text-muted-foreground">

            Capture knowledge. Connect ideas. Build wisdom.

          </p>

        </div>

        {isUnlocked && (

          <Button className="shrink-0 rounded-full" onClick={openNewEntry}>

            <Plus className="mr-2 h-4 w-4" />

            New Entry

          </Button>

        )}

      </div>



      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">

        {stats.map((stat) => (

          <Card key={stat.label} className="overflow-hidden border-border bg-card">

            <CardContent className="p-4">

              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">

                {stat.label}

              </p>

              <p className="mt-1 text-2xl font-bold">{stat.value}</p>

              <p className="break-words text-[10px] text-muted-foreground line-clamp-2">

                {stat.sub}

              </p>

            </CardContent>

          </Card>

        ))}

      </div>



      {!isUnlocked ? (

        <VaultLockedState lock={data.lock} />

      ) : (

        <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden lg:flex-row">

          <VaultCollectionsPanel

            data={data}

            activeFilter={activeFilter}

            onFilterChange={setActiveFilter}

          />



          <div className="min-w-0 flex-1 space-y-4">

            <VaultKnowledgeFeed

              entries={visibleEntries}

              selectedId={selectedId}

              onSelect={(entry) => {

                setSelectedId(entry.id);

                openEditEntry(entry.id);

              }}

              onCreateFirst={openNewEntry}

              canCreate

            />

            <VaultKnowledgeGraph

              entries={data.entries}

              onCreateConnection={openNewEntry}

            />

          </div>

        </div>

      )}



      {isUnlocked && <VaultEntrySheet data={data} />}

    </div>

  );

}


