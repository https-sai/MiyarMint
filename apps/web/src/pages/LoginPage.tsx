import { Link, useNavigate } from "react-router-dom"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <div className="mb-8 lg:hidden">
        <p className="font-mono text-[10px] tracking-[0.28em] text-primary">DESK</p>
        <p className="font-heading text-sm font-semibold tracking-[0.18em] uppercase">
          MyrMint
        </p>
      </div>
      <p className="kicker">Access</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight uppercase">
        Sign in
      </h1>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        School email required. Opens the paper book.
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          navigate("/dashboard")
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            defaultValue="amina@lincoln.edu"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            defaultValue="password"
            className="h-10"
          />
        </div>
        <Button type="submit" className="h-10 w-full">
          Continue
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
