import { formatPct } from "@/lib/format"
import { cn } from "@/lib/utils"

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
        "font-mono tabular-nums",
        positive ? "text-gain" : "text-loss",
        className,
      )}
    >
      {formatted}
    </span>
  )
}
