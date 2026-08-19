import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"

import { useAuth } from "@/auth/AuthContext"
import { ProductName } from "@/components/BrandMark"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createAccountSchema } from "@/lib/schemas"

export function CreateAccountPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [role, setRole] = useState<"student" | "educator">("student")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const parsed = createAccountSchema.safeParse({
      displayName: form.get("displayName"),
      email: form.get("email"),
      password: form.get("password"),
      role,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again.")
      return
    }

    setError(null)
    setNotice(null)
    setPending(true)
    try {
      const result = await signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        displayName: parsed.data.displayName,
        role: parsed.data.role,
      })
      if (result.needsEmailConfirmation) {
        setNotice("Check your school email to confirm the account, then sign in.")
        return
      }
      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.")
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8 lg:hidden">
        <p className="font-mono text-[10px] tracking-[0.28em] text-primary">DESK</p>
        <ProductName />
      </div>
      <p className="kicker">Onboarding</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight uppercase">
        Open account
      </h1>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        Students start at $100,000 simulated cash. Educators open classrooms.
      </p>
      <form className="mt-8 space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" name="displayName" className="h-10" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">School email</Label>
          <Input id="email" name="email" type="email" className="h-10" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={role}
            onValueChange={(value) => {
              if (value === "student" || value === "educator") setRole(value)
            }}
          >
            <SelectTrigger id="role" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="educator">Educator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="h-10"
            required
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {notice ? <p className="text-sm text-primary">{notice}</p> : null}
        <Button type="submit" className="h-10 w-full" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
        Already on the desk?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
