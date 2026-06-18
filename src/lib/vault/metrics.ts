export type VaultLinkSource = {
  linkedVision?: unknown;
  linkedGoal?: unknown;
  linkedAction?: unknown;
  linkedFocusSession?: unknown;
};

export type VaultTagSource = {
  tags?: string[];
};

export function isVaultEntryLinked(entry: VaultLinkSource) {
  return Boolean(
    entry.linkedVision ||
      entry.linkedGoal ||
      entry.linkedAction ||
      entry.linkedFocusSession
  );
}

export function calculateKnowledgeAlignment(entries: VaultLinkSource[]) {
  if (entries.length === 0) return 0;

  const linkedCount = entries.filter(isVaultEntryLinked).length;
  return Math.round((linkedCount / entries.length) * 100);
}

export function normalizeTags(tags: string[]) {
  const unique = new Set<string>();

  for (const tag of tags) {
    const normalized = tag.trim().toLowerCase();
    if (normalized) unique.add(normalized);
  }

  return Array.from(unique);
}

export function buildTagCollections(entries: VaultTagSource[]) {
  const tagMap = new Map<string, number>();

  for (const entry of entries) {
    for (const tag of entry.tags ?? []) {
      const normalized = tag.trim().toLowerCase();
      if (!normalized) continue;
      tagMap.set(normalized, (tagMap.get(normalized) ?? 0) + 1);
    }
  }

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({
      id: name,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function filterEntriesByTag<T extends VaultTagSource>(
  entries: T[],
  tag?: string
) {
  if (!tag) return entries;

  const normalized = tag.trim().toLowerCase();
  return entries.filter((entry) =>
    (entry.tags ?? []).some((value) => value.trim().toLowerCase() === normalized)
  );
}
