import OpenAI from "openai"
import { NextResponse } from "next/server"
import { readBearer } from "@/lib/auth"
import { getTopRecommendations } from "@/lib/recommendation-engine"
import { schemes } from "@/lib/schemes-data"
import type { UserProfile } from "@/lib/types"

export const runtime = "nodejs"

function parseAiMatches(text: string, profile: UserProfile) {
  const json = text.match(/\[[\s\S]*\]/)?.[0]
  if (!json) return null
  const selections = JSON.parse(json) as { id: string; matchScore: number }[]
  const fallbackScores = new Map(getTopRecommendations(profile, schemes.length).map((scheme) => [scheme.id, scheme.matchScore]))
  return selections
    .map(({ id, matchScore }) => {
      const scheme = schemes.find((item) => item.id === id)
      return scheme ? { ...scheme, matchScore: Math.max(1, Math.min(100, Number(matchScore) || fallbackScores.get(id) || 50)) } : null
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
}

export async function POST(request: Request) {
  if (!readBearer(request)) return NextResponse.json({ error: "Please log in again." }, { status: 401 })
  const profile = (await request.json()) as UserProfile
  const fallback = getTopRecommendations(profile, 8)
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ matches: fallback, source: "local" })
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const catalog = schemes.map(({ id, name, state, category, eligibilitySummary, tags, benefit }) => ({ id, name, state, category, eligibilitySummary, tags, benefit }))
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6",
      tools: [{ type: "web_search" }],
      input: `You are an Indian government-scheme matching assistant. Match the user to schemes ONLY from this supplied catalog. Use web search to sanity-check current relevance, but never invent a scheme. Return ONLY a JSON array of at most 8 objects: {"id":"catalog-id","matchScore":number}. Scores must be 1-100 and reflect likely fit, not guaranteed eligibility.\n\nUser profile:\n${JSON.stringify(profile)}\n\nCatalog:\n${JSON.stringify(catalog)}`,
    })
    const matches = parseAiMatches(response.output_text, profile)
    return NextResponse.json({ matches: matches?.length ? matches : fallback, source: matches?.length ? "ai" : "local" })
  } catch (error) {
    console.error("Recommendation AI failed", error)
    return NextResponse.json({ matches: fallback, source: "local" })
  }
}
