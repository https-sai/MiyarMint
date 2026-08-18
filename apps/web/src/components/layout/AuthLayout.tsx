import type { ReactNode } from "react"

import { BrandMark } from "@/components/BrandMark"

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.15fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r bg-sidebar px-12 py-12 lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgb(220 227 234 / 6%) 1px, transparent 1px), linear-gradient(90deg, rgb(220 227 234 / 6%) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <BrandMark to="/login" />
        <div className="relative mt-auto max-w-lg space-y-5">
          <p className="kicker text-primary">Equity desk // classroom session</p>
          <p className="font-heading text-4xl leading-[1.1] font-semibold tracking-tight uppercase">
            Paper tape.
            <br />
            Screened names.
            <br />
            Simulated capital.
          </p>
          <p className="max-w-sm font-mono text-xs leading-relaxed text-muted-foreground">
            Halal-screened equities only. Each book opens at $100,000. Orders
            fill against last trade — no live routing.
          </p>
        </div>
      </aside>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
