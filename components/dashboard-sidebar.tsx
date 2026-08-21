"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Sparkles,
  Heart,
  History,
  UserRound,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { clearAuthUser, getAuthUser } from "@/lib/storage"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Find Schemes", href: "/find-scheme", icon: Sparkles },
  { label: "My Recommendations", href: "/recommendations", icon: History },
  { label: "Saved Schemes", href: "/saved", icon: Heart },
  { label: "Profile", href: "/profile", icon: UserRound },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    setUser(getAuthUser())
  }, [])

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U"

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="size-4.5" />
        </span>
        <span className="flex flex-col leading-none">
          <span className="font-heading text-[1.05rem] font-bold tracking-tight text-foreground">SchemeSathi</span>
          <span className="text-[0.65rem] font-medium text-muted-foreground">Government schemes, simplified.</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
          )
        })}
        <Link
          href="/#help"
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HelpCircle className="size-4.5" />
          Help
        </Link>
      </nav>

      <div className="mt-auto flex items-center gap-3 border-t border-border/60 px-4 py-4">
        <Avatar className="size-9">
          <AvatarFallback className="bg-accent text-accent-foreground">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold text-foreground">{user?.name ?? "Guest User"}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email ?? "Not signed in"}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Log out"
          onClick={() => {
            clearAuthUser()
            router.push("/")
          }}
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-heading text-sm font-bold text-foreground">SchemeSathi</span>
        </Link>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="flex size-9 items-center justify-center rounded-lg text-foreground"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-foreground/30 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-72 bg-sidebar shadow-xl transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-lg text-foreground"
          >
            <X className="size-4" />
          </button>
          {content}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border/60 bg-sidebar lg:block">
        {content}
      </aside>
    </>
  )
}
