import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"

import { useAuth } from "@/auth/AuthContext"
import { ProductName } from "@/components/BrandMark"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema } from "@/lib/schemas"

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const parsed = loginSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again.")
      return
    }

    setError(null)
    setPending(true)
    try {
      await signIn(parsed.data.email, parsed.data.password)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.")
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
      <p className="kicker">Access</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight uppercase">
        Sign in
      </h1>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        School email required. Opens the paper book.
      </p>
      <form className="mt-8 space-y-4" onSubmit={(event) => void onSubmit(event)}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="h-10"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="h-10"
            required
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="h-10 w-full" disabled={pending}>
          {pending ? "Signing in…" : "Continue"}
        </Button>
      </form>
      <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
        New desk?{" "}
        <Link to="/create-account" className="text-primary hover:underline">
          Open an account
        </Link>
      </p>
    </AuthLayout>
  )
}
