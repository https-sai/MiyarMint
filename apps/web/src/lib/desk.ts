import { useMemo, useState } from "react"

import type { ClassroomSummary } from "@/api/types"
import { useClassroomsQuery } from "@/api/hooks"
import { useAuth } from "@/auth/AuthContext"
import {
  readActiveClassroomId,
  writeActiveClassroomId,
} from "@/lib/classroom"
import { readWatchlist, writeWatchlist } from "@/lib/watchlist"

export function useActiveClassroom() {
  const { user } = useAuth()
  const query = useClassroomsQuery()
  const classrooms = query.data?.classrooms ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const stored = user?.id ? readActiveClassroomId(user.id) : null
  const activeId =
    (selectedId && classrooms.some((row) => row.id === selectedId)
      ? selectedId
      : null) ??
    (stored && classrooms.some((row) => row.id === stored) ? stored : null) ??
    classrooms[0]?.id ??
    null

  function selectClassroom(id: string) {
    setSelectedId(id)
    if (user?.id) writeActiveClassroomId(user.id, id)
  }

  const active: ClassroomSummary | null =
    classrooms.find((row) => row.id === activeId) ?? null

  return {
    ...query,
    classrooms,
    active,
    selectClassroom,
  }
}

export function useWatchlist(fallback: string[]) {
  const { user } = useAuth()
  const [local, setLocal] = useState<string[] | null>(null)
  const stored = user?.id ? readWatchlist(user.id) : []
  const resolved = local ?? (stored.length > 0 ? stored : fallback)
  const key = resolved.join(",")
  const tickers = useMemo(() => key.split(",").filter(Boolean), [key])

  function setWatchlist(next: string[]) {
    setLocal(next)
    if (user?.id) writeWatchlist(user.id, next)
  }

  return { tickers, setWatchlist }
}
