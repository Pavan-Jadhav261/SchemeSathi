"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Check, Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MatchRing } from "@/components/match-ring"
import { isSchemeSaved, toggleSavedScheme } from "@/lib/storage"
import { getCategoryById } from "@/lib/categories-data"
import { cn } from "@/lib/utils"
import type { Scheme, SchemeMatch } from "@/lib/types"

export function SchemeCard({
  scheme,
  matchScore,
  className,
}: {
  scheme: Scheme | SchemeMatch
  matchScore?: number
  className?: string
}) {
  const score = matchScore ?? ("matchScore" in scheme ? scheme.matchScore : undefined)
  const [saved, setSaved] = useState(false)
  const category = getCategoryById(scheme.category)

  useEffect(() => {
    setSaved(isSchemeSaved(scheme.id))
  }, [scheme.id])

  return (
    <div
      className={cn(
        "neu-card group flex flex-col gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Badge variant="secondary" className="mb-2 bg-accent text-accent-foreground">
            {category?.label ?? scheme.category}
          </Badge>
          <h3 className="font-heading text-lg font-bold leading-snug text-foreground">{scheme.shortName}</h3>
          <p className="mt-1 text-xs font-medium text-muted-foreground">{scheme.department}</p>
        </div>
        {score !== undefined && <MatchRing score={score} />}
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{scheme.overview}</p>

      <div className="neu-inset rounded-xl px-3.5 py-2.5">
        <p className="text-xs font-medium text-muted-foreground">Benefit</p>
        <p className="font-heading text-sm font-bold text-foreground">
          {scheme.benefitAmount ?? scheme.benefit}
        </p>
      </div>

      <ul className="flex flex-col gap-1.5">
        {scheme.eligibilitySummary.slice(0, 3).map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="size-3.5 shrink-0 text-scheme-green" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center gap-2 pt-1">
        <Button
          className="flex-1 font-semibold"
          render={<Link href={`/scheme/${scheme.id}`} />}
          nativeButton={false}
        >
          View Details
          <ArrowRight data-icon="inline-end" />
        </Button>
        <Button
          variant="outline"
          size="icon-lg"
          aria-label={saved ? "Remove from saved schemes" : "Save scheme"}
          onClick={() => setSaved(toggleSavedScheme(scheme.id, score))}
        >
          <Heart className={cn("size-4 transition-all", saved && "fill-saffron text-saffron")} />
        </Button>
      </div>
    </div>
  )
}
