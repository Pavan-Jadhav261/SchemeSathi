"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Schemes", href: "/schemes" },
  { label: "About", href: "/#about" },
]

export function SiteNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-4.5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-[1.05rem] font-bold tracking-tight text-foreground">SchemeSathi</span>
            <span className="text-[0.68rem] font-medium text-muted-foreground">Government schemes, simplified.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="lg"
            render={<Link href="/login" />}
            nativeButton={false}
            className="font-medium"
          >
            Log In
          </Button>
          <Button size="lg" render={<Link href="/signup" />} nativeButton={false} className="font-semibold shadow-sm">
            Get Started
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-lg text-foreground md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          "grid overflow-hidden border-t border-border/60 bg-background transition-[grid-template-rows] duration-300 md:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-3">
              <Button variant="outline" render={<Link href="/login" />} nativeButton={false}>
                Log In
              </Button>
              <Button render={<Link href="/signup" />} nativeButton={false}>
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
