export type FocusSessionMetricSource = {
  startedAt: Date;
  endedAt?: Date | null;
  duration: number;
  quality: number;
};

export function startOfWeek(date = new Date()) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function calculateWeeklyDeepWorkMinutes(
  sessions: FocusSessionMetricSource[],
  weekStart = startOfWeek()
) {
  return sessions
    .filter(
      (session) =>
        session.endedAt &&
        new Date(session.startedAt) >= weekStart &&
        session.duration > 0
    )
    .reduce((sum, session) => sum + session.duration, 0);
}

export function calculateWeeklyDeepWorkHours(
  sessions: FocusSessionMetricSource[],
  weekStart = startOfWeek()
) {
  const minutes = calculateWeeklyDeepWorkMinutes(sessions, weekStart);
  return Math.round((minutes / 60) * 10) / 10;
}

export type FocusWindow = {
  startHour: number;
  endHour: number;
  label: string;
  score: number;
  sessionCount: number;
};

function formatHourLabel(hour: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized} ${period}`;
}

export function calculateBestFocusWindow(
  sessions: FocusSessionMetricSource[]
): FocusWindow | null {
  const completed = sessions.filter(
    (session) => session.endedAt && session.duration > 0
  );

  if (completed.length === 0) return null;

  const hourBuckets = new Map<
    number,
    { minutes: number; qualitySum: number; count: number }
  >();

  for (const session of completed) {
    const hour = new Date(session.startedAt).getHours();
    const bucket = hourBuckets.get(hour) ?? {
      minutes: 0,
      qualitySum: 0,
      count: 0,
    };

    bucket.minutes += session.duration;
    bucket.qualitySum += session.quality;
    bucket.count += 1;
    hourBuckets.set(hour, bucket);
  }

  let bestHour = 0;
  let bestScore = -1;
  let bestCount = 0;

  for (const [hour, bucket] of hourBuckets.entries()) {
    const avgQuality = bucket.qualitySum / bucket.count;
    const score = bucket.minutes * (avgQuality / 100);

    if (score > bestScore) {
      bestHour = hour;
      bestScore = score;
      bestCount = bucket.count;
    }
  }

  const endHour = (bestHour + 1) % 24;

  return {
    startHour: bestHour,
    endHour,
    label: `${formatHourLabel(bestHour)} – ${formatHourLabel(endHour)}`,
    score: Math.round(bestScore),
    sessionCount: bestCount,
  };
}

export function buildConsistencyGrid(
  sessions: FocusSessionMetricSource[],
  days = 7
) {
  const grid: { date: string; minutes: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toDateString();

    const minutes = sessions
      .filter((session) => new Date(session.startedAt).toDateString() === key)
      .reduce((sum, session) => sum + session.duration, 0);

    grid.push({
      date: date.toISOString().slice(0, 10),
      minutes,
    });
  }

  return grid;
}
