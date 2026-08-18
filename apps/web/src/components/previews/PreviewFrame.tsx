import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

const railItems = [
  "dashboard",
  "portfolio",
  "trade",
  "leaderboard",
  "learn",
  "account",
] as const

export function PreviewFrame({
  to,
  label,
  active,
  children,
  className,
}: {
  to: string
  label: string
  active: (typeof railItems)[number]
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative block focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
        className,
      )}
    >
      <div className="relative overflow-hidden border border-foreground/20 bg-[#0c1018] transition-colors group-hover:border-primary/50">
        <div className="flex items-center justify-between border-b border-foreground/15 bg-[#05070c] px-3 py-1.5">
          <span className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            {to.replace("/", "")}//live
          </span>
          <span className="font-mono text-[10px] text-gain">REC</span>
        </div>
        <div aria-hidden className="relative h-52 overflow-hidden">
          <div className="flex h-full">
            <div className="flex w-8 flex-col gap-1 border-r border-foreground/15 bg-[#05070c] py-3 pl-2">
              {railItems.map((item) => (
                <span
                  key={item}
                  className={cn(
                    "h-1 w-4",
                    item === active ? "bg-primary" : "bg-white/15",
                  )}
                />
              ))}
            </div>
            <div className="min-w-0 flex-1 p-3">{children}</div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.16em] uppercase">
          {label}
        </span>
        <span className="font-mono text-[10px] tracking-[0.14em] text-primary uppercase opacity-0 transition-opacity group-hover:opacity-100">
          Open
        </span>
      </div>
    </Link>
  )
}
