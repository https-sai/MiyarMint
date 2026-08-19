import { Navigate, useLocation } from "react-router-dom"
import type { ReactNode } from "react"

import { useAuth } from "@/auth/AuthContext"

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        Restoring session
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export function PublicOnly({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        Restoring session
      </div>
    )
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
