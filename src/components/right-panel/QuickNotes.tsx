import Link from "next/link";
import type { RightPanelNote } from "@/components/right-panel/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QuickNotesProps = {
  notes: RightPanelNote[];
};

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${Math.max(hours, 1)}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

export function QuickNotes({ notes }: QuickNotesProps) {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="truncate text-sm font-semibold">Quick Notes</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {notes.length > 0 ? (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface px-3 py-2"
              >
                <Link
                  href="/dashboard/vault"
                  className="block truncate text-sm font-semibold hover:text-primary"
                >
                  {note.title}
                </Link>
                {note.preview && (
                  <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {note.preview}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {formatRelative(note.updatedAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="break-words text-xs text-muted-foreground line-clamp-2">
            No knowledge captured yet.{" "}
            <Link href="/dashboard/vault" className="text-primary hover:underline">
              Open Vault
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
