import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

export function ProductName({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-baseline gap-2", className)}>
      <span className="font-heading text-sm font-semibold tracking-[0.18em] uppercase">
        MyrMint
      </span>
      <span
        lang="ar"
        dir="rtl"
        title="Myr"
        className="font-ar text-base leading-none font-semibold text-primary"
      >
        مَيْر
      </span>
    </span>
  )
}

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
        <ProductName />
      </span>
    </Link>
  )
}
