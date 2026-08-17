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
      <div className="mb-8 space-y-1 lg:hidden">
        <p className="font-heading text-lg font-medium">MyrMint</p>
      </div>
      <h1 className="font-heading text-2xl font-medium tracking-tight">
        Create account
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Students start with $100,000 in simulated cash. Educators can open
        classrooms.
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
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
