import { ChangeText } from "@/components/ChangeText"
import { PreviewFrame } from "@/components/previews/PreviewFrame"
import { leaderboard } from "@/data/mock"
import { cn } from "@/lib/utils"

export function LeaderboardPreview() {
  const you = leaderboard.find((row) => row.isYou)

  return (
    <PreviewFrame to="/leaderboard" label="Leaderboard Preview" active="leaderboard">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-medium tracking-tight">Leaderboard</p>
          {you ? (
            <p className="text-[9px] text-primary">You · #{you.rank}</p>
          ) : null}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {leaderboard.slice(0, 3).map((row) => (
            <div
              key={row.rank}
              className={cn(
                "rounded-md px-1.5 py-1.5 ring-1",
                row.rank === 1
                  ? "bg-primary/10 ring-primary/35"
                  : "bg-white/5 ring-white/8",
              )}
            >
              <p className="text-[8px] text-muted-foreground">#{row.rank}</p>
              <p className="truncate text-[10px] font-medium">{row.name.split(" ")[0]}</p>
              <ChangeText value={row.returnPct} className="text-[9px]" />
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {leaderboard.slice(0, 5).map((row) => (
            <div
              key={row.rank}
              className={cn(
                "flex items-center justify-between rounded-md px-1.5 py-1 text-[10px]",
                row.isYou && "bg-primary/10",
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="w-3 tabular-nums text-muted-foreground">{row.rank}</span>
                <span className="truncate font-medium">{row.name}</span>
              </span>
              <ChangeText value={row.returnPct} className="text-[10px]" />
            </div>
          ))}
        </div>
      </div>
    </PreviewFrame>
  )
}
