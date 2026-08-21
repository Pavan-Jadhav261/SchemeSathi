"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SchemeCard } from "@/components/scheme-card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { schemes } from "@/lib/schemes-data"
import { categories } from "@/lib/categories-data"
import { cn } from "@/lib/utils"
import type { CategoryId } from "@/lib/types"

function SchemesExplorer() {
  const searchParams = useSearchParams()
  const initialCategory = (searchParams.get("category") as CategoryId | null) ?? null

  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(initialCategory)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return schemes.filter((s) => {
      if (activeCategory && s.category !== activeCategory) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        return (
          s.name.toLowerCase().includes(q) ||
          s.shortName.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [activeCategory, query])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:px-12">
      <div className="reveal">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground text-balance">
          Explore government schemes
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Browse {schemes.length}+ central and state schemes by category, or search by keyword.
        </p>
      </div>

      <div className="reveal mt-6 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schemes, e.g. scholarship, farmer, pension..."
            className="pl-10"
            aria-label="Search schemes"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setActiveCategory(null)}>
            <Badge
              variant={activeCategory === null ? "default" : "secondary"}
              className={cn("cursor-pointer px-3 py-1.5 text-xs", activeCategory === null && "bg-primary")}
            >
              All schemes
            </Badge>
          </button>
          {categories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)}>
              <Badge
                variant={activeCategory === cat.id ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-xs",
                  activeCategory === cat.id ? "bg-primary" : "bg-accent text-accent-foreground",
                )}
              >
                {cat.label}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No schemes found</EmptyTitle>
            <EmptyDescription>Try a different keyword or clear the category filter.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((scheme, i) => (
            <div key={scheme.id} className="reveal" style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}>
              <SchemeCard scheme={scheme} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SchemesPage() {
  return (
    <Suspense fallback={null}>
      <SchemesExplorer />
    </Suspense>
  )
}
