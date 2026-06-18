import { createHash } from "crypto";

export function stableStringify(value: unknown): string {
  if (value === null || value === undefined) {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();

  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

export function computeBackupChecksum(
  backup: Record<string, unknown>
): string {
  const { checksum: _checksum, ...payload } = backup;
  return createHash("sha256").update(stableStringify(payload)).digest("hex");
}

export function verifyBackupChecksum(backup: Record<string, unknown>): {
  status: "valid" | "legacy" | "invalid";
  expected?: string;
  actual?: string;
} {
  const actual =
    typeof backup.checksum === "string" ? backup.checksum : undefined;

  if (!actual) {
    return { status: "legacy" };
  }

  const expected = computeBackupChecksum(backup);
  if (expected !== actual) {
    return { status: "invalid", expected, actual };
  }

  return { status: "valid", expected, actual };
}
