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
        "group relative block rounded-2xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
        className,
      )}
    >
      <div className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-primary/30 opacity-40 blur-2xl transition-opacity group-hover:opacity-75" />
      <div className="relative overflow-hidden rounded-2xl bg-[#0b1220] shadow-[0_0_48px_-16px_#00f5d4] ring-1 ring-primary/30 transition-transform duration-200 group-hover:-translate-y-0.5">
        <div className="flex items-center gap-1.5 border-b border-white/8 bg-[#070b14] px-3 py-2">
          <span className="size-1.5 rounded-full bg-white/20" />
          <span className="size-1.5 rounded-full bg-white/20" />
          <span className="size-1.5 rounded-full bg-white/20" />
          <span className="ml-2 truncate text-[10px] tracking-wide text-muted-foreground">
            myrmint.app{to}
          </span>
        </div>
        <div aria-hidden className="relative h-52 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_18%_-10%,rgba(0,245,212,0.28),transparent_58%)]" />
          <div className="flex h-full">
            <div className="flex w-9 flex-col items-center gap-2 border-r border-white/8 bg-[#050810] py-3">
              {railItems.map((item) => (
                <span
                  key={item}
                  className={cn(
                    "size-1.5 rounded-full",
                    item === active ? "bg-primary" : "bg-white/15",
                  )}
                />
              ))}
            </div>
            <div className="min-w-0 flex-1 p-3">{children}</div>
          </div>
        </div>
      </div>
      <div className="relative mt-3 flex items-center justify-between px-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Open
        </span>
      </div>
    </Link>
  )
}
