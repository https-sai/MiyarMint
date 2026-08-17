import type { ReactNode } from "react"
import { Link } from "react-router-dom"

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-sidebar px-12 py-12 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -top-24 -left-16 size-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 size-[22rem] rounded-full bg-gain/10 blur-3xl" />
        <Link to="/login" className="relative flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            M
          </span>
          <span className="font-heading text-lg font-medium">MyrMint</span>
        </Link>
        <div className="relative mt-auto max-w-md space-y-4">
          <p className="font-heading text-3xl leading-tight font-medium tracking-tight">
            Paper trading for classrooms, limited to halal-screened equities.
          </p>
          <p className="text-sm text-muted-foreground">
            Sign in, join a classroom, and buy or sell against a simulated
            portfolio that starts at $100,000.
          </p>
        </div>
      </aside>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
