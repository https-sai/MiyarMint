import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

const items = [
  { to: "/dashboard", label: "Dashboard", index: "01" },
  { to: "/portfolio", label: "Portfolio", index: "02" },
  { to: "/trade", label: "Trade", index: "03" },
  { to: "/leaderboard", label: "Leaderboard", index: "04" },
  { to: "/learn", label: "Learn", index: "05" },
  { to: "/account", label: "Account", index: "06" },
]

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-px">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 border-l-2 px-3 py-2.5 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors",
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground hover:border-foreground/20 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )
          }
        >
          <span className="w-5 text-[10px] text-muted-foreground">{item.index}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
