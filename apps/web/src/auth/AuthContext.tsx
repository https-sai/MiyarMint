/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Session, User } from "@supabase/supabase-js"

import { getMe } from "@/api/client"
import { supabase } from "@/api/supabase"
import type { Profile, UserRole } from "@/api/types"

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: {
    email: string
    password: string
    displayName: string
    role: UserRole
  }) => Promise<{ needsEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function ensureProfile(user: User, displayName?: string, role?: UserRole) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (existing) return

  await supabase.from("profiles").insert({
    id: user.id,
    role: role ?? "student",
    display_name: displayName ?? user.email?.split("@")[0] ?? null,
  })

  await supabase.from("portfolios").insert({ student_id: user.id })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      setProfile(null)
      return
    }
    try {
      const res = await getMe()
      setProfile(res.profile)
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
      if (data.session) void refreshProfile()
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (next?.user) {
        void refreshProfile()
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [refreshProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw error
    if (data.user) await ensureProfile(data.user)
  }, [])

  const signUp = useCallback(
    async (input: {
      email: string
      password: string
      displayName: string
      role: UserRole
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
      })
      if (error) throw error
      if (data.user) {
        await ensureProfile(data.user, input.displayName.trim(), input.role)
      }
      return { needsEmailConfirmation: !data.session }
    },
    [],
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [session, profile, loading, signIn, signUp, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
