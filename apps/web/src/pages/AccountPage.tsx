import { useNavigate } from "react-router-dom"

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
import { currentUser } from "@/data/mock"

export function AccountPage() {
  const navigate = useNavigate()

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
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary/15 text-primary">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.role}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input id="display-name" defaultValue={currentUser.name} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={currentUser.email}
                className="h-10"
              />
            </div>
          </div>
          <Button type="button" variant="secondary">
            Save changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classroom</CardTitle>
          <CardDescription>{currentUser.classroom}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border border-border bg-muted/60 p-3">
            <p className="kicker">Join code</p>
            <p className="mt-1 font-mono text-sm font-medium tracking-[0.22em]">
              {currentUser.joinCode}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Switch classroom
            </Button>
            <Button variant="ghost" size="sm">
              Leave classroom
            </Button>
          </div>
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
            defaultChecked
          />
          <Separator />
          <Preference
            title="Leaderboard visibility"
            description="Let classmates see your display name"
            defaultChecked
          />
          <Separator />
          <Preference
            title="Push-style alerts"
            description="Placeholder — no backend wired"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Local-only sign out for this mock UI</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => navigate("/login")}>
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
  defaultChecked,
}: {
  title: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}
