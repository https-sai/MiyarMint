import type { ReactNode } from "react"

export function QueryState({
  loading,
  error,
  empty,
  children,
}: {
  loading?: boolean
  error?: string | null
  empty?: string | null
  children: ReactNode
}) {
  if (loading) {
    return (
      <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
        Loading
      </p>
    )
  }
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }
  if (empty) {
    return <p className="text-sm text-muted-foreground">{empty}</p>
  }
  return children
}
