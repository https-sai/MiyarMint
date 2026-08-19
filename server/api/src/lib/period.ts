export type LeaderboardPeriod = "week" | "month" | "all";

export function parsePeriod(value: unknown): LeaderboardPeriod {
  if (value === "week" || value === "month" || value === "all") return value;
  return "month";
}

export function periodStart(period: LeaderboardPeriod, now = new Date()): Date | null {
  if (period === "all") return null;
  const start = new Date(now);
  if (period === "week") {
    start.setUTCDate(start.getUTCDate() - 7);
  } else {
    start.setUTCDate(start.getUTCDate() - 30);
  }
  return start;
}
