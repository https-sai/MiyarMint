import { Link, useNavigate } from "react-router-dom"

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

export function CreateAccountPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <div className="mb-8 lg:hidden">
        <p className="font-mono text-[10px] tracking-[0.28em] text-primary">DESK</p>
        <p className="font-heading text-sm font-semibold tracking-[0.18em] uppercase">
          MyrMint
        </p>
      </div>
      <p className="kicker">Onboarding</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight uppercase">
        Open account
      </h1>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        Students start at $100,000 simulated cash. Educators open classrooms.
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          navigate("/dashboard")
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" defaultValue="Amina Rahman" className="h-10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">School email</Label>
          <Input
            id="email"
            type="email"
            defaultValue="amina@lincoln.edu"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select defaultValue="student">
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
            type="password"
            defaultValue="password"
            className="h-10"
          />
        </div>
        <Button type="submit" className="h-10 w-full">
          Create account
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
