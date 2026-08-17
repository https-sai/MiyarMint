import { Link, useNavigate } from "react-router-dom"

import { AuthLayout } from "@/components/layout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <div className="mb-8 space-y-1 lg:hidden">
        <p className="font-heading text-lg font-medium">MyrMint</p>
      </div>
      <h1 className="font-heading text-2xl font-medium tracking-tight">
        Sign in
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Use your school email to open your paper portfolio.
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
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/create-account" className="text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
