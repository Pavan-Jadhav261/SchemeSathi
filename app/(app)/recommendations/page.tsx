"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, RefreshCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SchemeCard } from "@/components/scheme-card"
import { getProfile } from "@/lib/storage"
import { getTopRecommendations } from "@/lib/recommendation-engine"
import type { SchemeMatch, UserProfile } from "@/lib/types"

export default function RecommendationsPage() {
  const [matches, setMatches] = useState<SchemeMatch[] | null>(null)
  const [profile, setProfile] = useState<UserProfile>({})

  useEffect(() => {
    const p = getProfile()
    setProfile(p)
    setMatches(getTopRecommendations(p, 8))
  }, [])

  if (!matches) return null

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:px-12">
      <div className="reveal flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-ai-blue">
            <Sparkles className="size-3.5" />
            Your recommendations
          </div>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground text-balance">
            {matches.length} schemes matched to your profile
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Ranked by how closely your details match published eligibility criteria. Higher match scores mean a
            stronger fit — always confirm final eligibility on the official portal.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/find-scheme" />} nativeButton={false} className="shrink-0">
          <RefreshCcw data-icon="inline-start" />
          Update my profile
        </Button>
      </div>

      {matches.length === 0 ? (
        <div className="neu-card mt-8 flex flex-col items-center gap-3 rounded-2xl p-12 text-center">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find a strong match yet. Try exploring schemes by category instead.
          </p>
          <Button render={<Link href="/schemes" />} nativeButton={false}>
            Explore all schemes
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match, i) => (
            <div key={match.id} className="reveal" style={{ animationDelay: `${i * 0.05}s` }}>
              <SchemeCard scheme={match} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
