"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SchemeCard } from "@/components/scheme-card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { getSavedSchemes } from "@/lib/storage"
import { getSchemeById } from "@/lib/schemes-data"
import type { SavedScheme } from "@/lib/types"

export default function SavedSchemesPage() {
  const [saved, setSaved] = useState<SavedScheme[] | null>(null)

  useEffect(() => {
    setSaved(getSavedSchemes())
  }, [])

  if (!saved) return null

  const resolved = saved
    .map((s) => ({ scheme: getSchemeById(s.schemeId), matchScore: s.matchScore }))
    .filter((s): s is { scheme: NonNullable<typeof s.scheme>; matchScore: number | undefined } => Boolean(s.scheme))

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:px-12">
      <div className="reveal">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground text-balance">
          Saved schemes
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Schemes you&apos;ve bookmarked for later. Saved locally in this browser.
        </p>
      </div>

      {resolved.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Heart />
            </EmptyMedia>
            <EmptyTitle>No saved schemes yet</EmptyTitle>
            <EmptyDescription>
              Tap the heart icon on any scheme to save it here for quick access later.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href="/schemes" />} nativeButton={false}>
              Explore schemes
              <ArrowRight data-icon="inline-end" />
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resolved.map(({ scheme, matchScore }, i) => (
            <div key={scheme.id} className="reveal" style={{ animationDelay: `${i * 0.05}s` }}>
              <SchemeCard scheme={scheme} matchScore={matchScore} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
