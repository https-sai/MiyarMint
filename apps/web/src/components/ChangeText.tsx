import { cn } from "@/lib/utils"
import { formatPct } from "@/lib/format"

export function ChangeText({
  value,
  className,
  asMoney,
}: {
  value: number
  className?: string
  asMoney?: boolean
}) {
  const positive = value >= 0
  const formatted = asMoney
    ? `${positive ? "+" : "-"}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : formatPct(value)

  return (
    <span
      className={cn(
        "tabular-nums",
        positive ? "text-gain" : "text-loss",
        className,
      )}
    >
      {formatted}
    </span>
  )
}
