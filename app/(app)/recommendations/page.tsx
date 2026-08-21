"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Loader2, RefreshCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SchemeCard } from "@/components/scheme-card"
import { getAccessToken, getProfile, getRecommendationCache, saveRecommendationCache } from "@/lib/storage"
import type { SchemeMatch, UserProfile } from "@/lib/types"

const pendingRecommendations = new Map<string, Promise<{ matches: SchemeMatch[]; usingAi: boolean }>>()

export default function RecommendationsPage() {
  const [matches, setMatches] = useState<SchemeMatch[] | null>(null)
  const [profile, setProfile] = useState<UserProfile>({})
  const [usingAi, setUsingAi] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const p = getProfile()
    setProfile(p)
    const cached = getRecommendationCache(p)
    if (cached) {
      // Keep the transition visible even when no network request is needed.
      const timer = window.setTimeout(() => {
        setMatches(cached.matches)
        setUsingAi(cached.usingAi)
        setLoading(false)
      }, 450)
      return () => window.clearTimeout(timer)
    }
    async function load() {
      try {
        const cacheKey = JSON.stringify(p)
        let pending = pendingRecommendations.get(cacheKey)
        if (!pending) {
          pending = fetch("/api/recommendations", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAccessToken()}` },
            body: cacheKey,
          }).then(async (response) => {
            const result = await response.json()
            if (!response.ok) throw new Error(result.error)
            return { matches: result.matches as SchemeMatch[], usingAi: result.source === "ai" }
          }).finally(() => pendingRecommendations.delete(cacheKey))
          pendingRecommendations.set(cacheKey, pending)
        }
        const result = await pending
        setMatches(result.matches)
        setUsingAi(result.usingAi)
        saveRecommendationCache(p, result.matches, result.usingAi)
      } catch {
        setMatches([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  if (loading || !matches) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-ai-blue/15 text-ai-blue-foreground"><Loader2 className="size-6 animate-spin" /></span>
        <div><h1 className="font-heading text-xl font-bold text-foreground">Finding your best scheme matches…</h1><p className="mt-1 text-sm text-muted-foreground">Checking eligibility criteria and current scheme information.</p></div>
      </div>
    )
  }

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
          {usingAi && <p className="mt-2 text-xs font-medium text-ai-blue">AI-assisted results checked against the scheme catalog.</p>}
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
