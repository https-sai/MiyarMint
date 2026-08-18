import { Menu } from "lucide-react"
import { useState } from "react"
import { Link, Outlet } from "react-router-dom"

import { BrandMark } from "@/components/BrandMark"
import { SessionClock } from "@/components/SessionClock"
import { TickerTape } from "@/components/TickerTape"
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

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border px-4 py-5">
        <BrandMark />
      </div>
      <p className="kicker px-4 pt-5 pb-2">Equity desk</p>
      <div className="flex-1 px-2">
        <SidebarNav onNavigate={onNavigate} />
      </div>
      <Separator />
      <Link
        to="/account"
        onClick={onNavigate}
        className="flex items-center gap-3 px-4 py-4 hover:bg-sidebar-accent"
      >
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/15 font-mono text-primary">
            {currentUser.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-mono text-xs tracking-wide uppercase">
            {currentUser.name}
          </p>
          <p className="truncate font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
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
        <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-md">
          <div className="flex h-12 items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-3">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      aria-label="Open menu"
                    />
                  }
                >
                  <Menu />
                </SheetTrigger>
                <SheetContent side="left" className="w-60 rounded-none bg-sidebar p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <SidebarBody onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
              <div className="lg:hidden">
                <BrandMark compact />
              </div>
              <p className="hidden font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase sm:block lg:inline">
                NYSE · Halal book · Paper
              </p>
            </div>
            <SessionClock />
          </div>
          <TickerTape />
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
