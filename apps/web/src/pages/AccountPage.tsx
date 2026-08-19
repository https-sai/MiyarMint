import { useState, type FormEvent } from "react"

import {
  useCreateClassroomMutation,
  useJoinClassroomMutation,
  useLeaveClassroomMutation,
  useUpdateProfileMutation,
} from "@/api/hooks"
import { useAuth } from "@/auth/AuthContext"
import { PageHeader } from "@/components/PageHeader"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useActiveClassroom } from "@/lib/desk"
import { initials } from "@/lib/numbers"
import { readPreferences, writePreferences } from "@/lib/preferences"
import {
  createClassroomSchema,
  joinClassroomSchema,
  profileSchema,
} from "@/lib/schemas"

export function AccountPage() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const { classrooms, active, selectClassroom } = useActiveClassroom()
  const updateProfile = useUpdateProfileMutation()
  const join = useJoinClassroomMutation()
  const create = useCreateClassroomMutation()
  const leave = useLeaveClassroomMutation()

  const [nameDraft, setNameDraft] = useState<string | null>(null)
  const [visibleDraft, setVisibleDraft] = useState<boolean | null>(null)
  const [prefRevision, setPrefRevision] = useState(0)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileNotice, setProfileNotice] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const displayName = nameDraft ?? profile?.display_name ?? ""
  const visible = visibleDraft ?? profile?.leaderboard_visible !== false
  const prefs =
    user?.id && prefRevision >= 0
      ? readPreferences(user.id)
      : { tradeConfirmations: true, alerts: false }

  const isEducator = profile?.role === "educator" || profile?.role === "admin"

  async function onSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = profileSchema.safeParse({ displayName })
    if (!parsed.success) {
      setProfileError(parsed.error.issues[0]?.message ?? "Invalid name.")
      return
    }
    setProfileError(null)
    try {
      await updateProfile.mutateAsync({
        display_name: parsed.data.displayName,
        leaderboard_visible: visible,
      })
      setProfileNotice("Profile saved.")
      setNameDraft(null)
      setVisibleDraft(null)
      await refreshProfile()
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Could not save profile.")
    }
  }

  async function onJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const parsed = joinClassroomSchema.safeParse({ joinCode: form.get("joinCode") })
    if (!parsed.success) {
      setJoinError(parsed.error.issues[0]?.message ?? "Invalid join code.")
      return
    }
    setJoinError(null)
    try {
      const result = await join.mutateAsync(parsed.data.joinCode)
      selectClassroom(result.classroom.id)
      event.currentTarget.reset()
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Could not join classroom.")
    }
  }

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const parsed = createClassroomSchema.safeParse({ name: form.get("name") })
    if (!parsed.success) {
      setCreateError(parsed.error.issues[0]?.message ?? "Invalid name.")
      return
    }
    setCreateError(null)
    try {
      const result = await create.mutateAsync(parsed.data.name)
      selectClassroom(result.id)
      event.currentTarget.reset()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create classroom.")
    }
  }

  function updatePref<K extends keyof typeof prefs>(key: K, value: boolean) {
    if (!user?.id) return
    const next = { ...prefs, [key]: value }
    writePreferences(user.id, next)
    setPrefRevision((count) => count + 1)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Account"
        description="Profile, classroom membership, and preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Shown to classmates on the leaderboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => void onSaveProfile(event)}>
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary/15 text-primary">
                  {initials(profile?.display_name, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {profile?.display_name ?? user?.email ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  {profile?.role ?? "student"}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(event) => setNameDraft(event.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email ?? ""}
                  className="h-10"
                  disabled
                />
              </div>
            </div>
            {profileError ? (
              <p className="text-sm text-destructive">{profileError}</p>
            ) : null}
            {profileNotice ? (
              <p className="text-sm text-primary">{profileNotice}</p>
            ) : null}
            <Button type="submit" variant="secondary" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classroom</CardTitle>
          <CardDescription>{active?.name ?? "Join or create a classroom"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {active ? (
            <div className="border border-border bg-muted/60 p-3">
              <p className="kicker">Join code</p>
              <p className="mt-1 font-mono text-sm font-medium tracking-[0.22em]">
                {active.join_code}
              </p>
            </div>
          ) : null}

          {classrooms.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {classrooms.map((row) => (
                <Button
                  key={row.id}
                  type="button"
                  variant={row.id === active?.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => selectClassroom(row.id)}
                >
                  {row.name}
                </Button>
              ))}
            </div>
          ) : null}

          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => void onJoin(event)}>
            <Input
              name="joinCode"
              placeholder="Join code"
              className="h-10 sm:max-w-48"
              autoComplete="off"
            />
            <Button type="submit" variant="outline" disabled={join.isPending}>
              {join.isPending ? "Joining…" : "Join classroom"}
            </Button>
          </form>
          {joinError ? <p className="text-sm text-destructive">{joinError}</p> : null}

          {isEducator ? (
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => void onCreate(event)}>
              <Input
                name="name"
                placeholder="New classroom name"
                className="h-10 sm:max-w-64"
              />
              <Button type="submit" variant="outline" disabled={create.isPending}>
                {create.isPending ? "Creating…" : "Create classroom"}
              </Button>
            </form>
          ) : null}
          {createError ? <p className="text-sm text-destructive">{createError}</p> : null}

          {active ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={leave.isPending}
              onClick={() => {
                void leave.mutateAsync(active.id)
              }}
            >
              Leave classroom
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Preference
            title="Trade confirmations"
            description="Show a notice after paper fills"
            checked={prefs.tradeConfirmations}
            onCheckedChange={(checked) => updatePref("tradeConfirmations", checked)}
          />
          <Separator />
          <Preference
            title="Leaderboard visibility"
            description="Let classmates see your display name"
            checked={visible}
            onCheckedChange={(checked) => {
              setVisibleDraft(checked)
              void updateProfile.mutateAsync({ leaderboard_visible: checked })
            }}
          />
          <Separator />
          <Preference
            title="Push-style alerts"
            description="Local preference only — web has no push token"
            checked={prefs.alerts}
            onCheckedChange={(checked) => updatePref("alerts", checked)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Sign out of this browser</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => {
              void signOut()
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Preference({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
