export type FocusTimingSource = {
  startedAt: Date;
  pausedAt?: Date | null;
  totalPausedSeconds?: number;
};

export function calculateFocusDurationSeconds(
  session: FocusTimingSource,
  endTime = new Date()
) {
  const effectiveEnd = session.pausedAt ?? endTime;
  const grossSeconds =
    (effectiveEnd.getTime() - new Date(session.startedAt).getTime()) / 1000;
  const pausedSeconds = session.totalPausedSeconds ?? 0;

  return Math.max(0, Math.floor(grossSeconds - pausedSeconds));
}

export function calculateFocusDurationMinutes(
  session: FocusTimingSource,
  endTime = new Date()
) {
  return Math.max(1, Math.round(calculateFocusDurationSeconds(session, endTime) / 60));
}

export function formatDurationClock(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}
