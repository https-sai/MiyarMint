import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

export function BrandMark({
  to = "/dashboard",
  compact = false,
}: {
  to?: string
  compact?: boolean
}) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center border border-primary bg-primary/10 font-mono text-xs font-semibold tracking-widest text-primary">
        MM
      </span>
      <span className={cn("leading-tight", compact && "hidden sm:block")}>
        <span className="block font-mono text-[10px] tracking-[0.28em] text-primary">
          DESK
        </span>
        <span className="block font-heading text-sm font-semibold tracking-[0.18em] uppercase">
          MyrMint
        </span>
      </span>
    </Link>
  )
}
