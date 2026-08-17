import { Menu } from "lucide-react"
import { useState } from "react"
import { Link, Outlet } from "react-router-dom"

import { SidebarNav } from "@/components/layout/SidebarNav"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { currentUser } from "@/data/mock"

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 px-3">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
        M
      </span>
      <span className="font-heading text-base font-medium tracking-tight">
        MyrMint
      </span>
    </Link>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-2 py-5">
        <Brand />
      </div>
      <div className="flex-1 px-3">
        <SidebarNav onNavigate={onNavigate} />
      </div>
      <Separator />
      <Link
        to="/account"
        onClick={onNavigate}
        className="flex items-center gap-3 px-5 py-4 hover:bg-sidebar-accent"
      >
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/15 text-primary">
            {currentUser.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{currentUser.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {currentUser.role}
          </p>
        </div>
      </Link>
    </div>
  )
}

export function AppLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <SidebarBody />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-60 bg-sidebar p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Brand />
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
