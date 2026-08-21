"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Sparkles, Heart, History, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAuthUser, getRecentSearches, getSavedSchemes } from "@/lib/storage"
import { categories } from "@/lib/categories-data"
import type { RecentSearch, SavedScheme } from "@/lib/types"

export default function DashboardPage() {
  const [name, setName] = useState("there")
  const [saved, setSaved] = useState<SavedScheme[]>([])
  const [recent, setRecent] = useState<RecentSearch[]>([])

  useEffect(() => {
    const user = getAuthUser()
    if (user?.name) setName(user.name)
    setSaved(getSavedSchemes())
    setRecent(getRecentSearches())
  }, [])

  const stats = [
    { label: "Saved schemes", value: saved.length, icon: Heart, href: "/saved" },
    { label: "Recent searches", value: recent.length, icon: History, href: "/find-scheme" },
    { label: "Categories to explore", value: categories.length, icon: Compass, href: "/schemes" },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8 lg:px-12">
      <div className="reveal">
        <p className="text-sm font-semibold text-muted-foreground">Welcome back,</p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
          {name} 👋
        </h1>
      </div>

      {/* Primary CTA card */}
      <div className="reveal neu-card mt-8 flex flex-col items-start gap-5 rounded-3xl p-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="size-6" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">Tell us what you need.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe your situation and let our AI find schemes you may be eligible for.
            </p>
          </div>
        </div>
        <Button
          size="lg"
          className="h-11 w-full font-semibold sm:w-auto"
          render={<Link href="/find-scheme" />}
          nativeButton={false}
        >
          Find My Schemes
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="reveal neu-card flex items-center gap-4 rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <stat.icon className="size-5" />
            </span>
            <div>
              <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent searches */}
      <div className="mt-10">
        <h3 className="font-heading text-lg font-bold text-foreground">Recent searches</h3>
        {recent.length === 0 ? (
          <div className="neu-card mt-4 flex flex-col items-center gap-3 rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">You haven&apos;t searched for schemes yet.</p>
            <Button render={<Link href="/find-scheme" />} nativeButton={false}>
              Find schemes for me
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {recent.slice(0, 5).map((search) => (
              <div key={search.id} className="neu-inset flex items-center justify-between rounded-xl px-4 py-3">
                <p className="truncate text-sm text-foreground">{search.query}</p>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {new Date(search.searchedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
