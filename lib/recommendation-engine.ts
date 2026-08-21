import { schemes } from "./schemes-data"
import type { SchemeMatch, UserProfile } from "./types"

/**
 * Mock, rule-based recommendation engine.
 *
 * This function is written so it can later be swapped for a real AI / API-backed
 * recommendation service without changing the call sites: it accepts a UserProfile
 * and free-text query, and returns ranked SchemeMatch results.
 */
export function getRecommendations(profile: UserProfile): SchemeMatch[] {
  const query = (profile.query ?? "").toLowerCase()

  const scored = schemes.map((scheme) => {
    let score = 45

    // Occupation-based matching
    if (profile.occupationType === "farmer" && scheme.category === "farmers") score += 35
    if (profile.occupationType === "student" && scheme.category === "students") score += 35
    if (profile.occupationType === "business-owner" && scheme.category === "entrepreneurs") score += 35
    if (profile.gender?.toLowerCase() === "female" && scheme.gender === "female") score += 25

    // Age based
    const age = Number(profile.age)
    if (!Number.isNaN(age) && age > 0) {
      if (age >= 60 && scheme.category === "senior-citizens") score += 30
      if (age >= 18 && age <= 40 && scheme.id === "atal-pension-yojana") score += 15
      if (age < 10 && scheme.id === "sukanya-samriddhi") score += 30
    }

    // Income based
    const income = Number(profile.annualIncome)
    if (!Number.isNaN(income) && income > 0) {
      if (income <= 250000 && scheme.category !== "entrepreneurs") score += 10
      if (income <= 250000 && scheme.category === "healthcare") score += 15
    }

    // BPL
    if (profile.bplStatus === "yes") score += 8

    // Keyword matching against free text query
    for (const tag of scheme.tags) {
      if (query.includes(tag)) score += 12
    }
    if (query.includes("farmer") && scheme.category === "farmers") score += 20
    if (query.includes("student") && scheme.category === "students") score += 20
    if (query.includes("women") || query.includes("girl")) {
      if (scheme.gender === "female") score += 20
    }
    if (query.includes("health") && scheme.category === "healthcare") score += 20
    if (query.includes("house") || query.includes("home")) {
      if (scheme.category === "housing") score += 20
    }
    if (query.includes("business") || query.includes("loan") || query.includes("shop")) {
      if (scheme.category === "entrepreneurs") score += 20
    }
    if (query.includes("pension") || query.includes("senior") || query.includes("old")) {
      if (scheme.category === "senior-citizens") score += 20
    }
    if (query.includes("scholarship") || query.includes("education") || query.includes("college")) {
      if (scheme.category === "students") score += 20
    }

    // small deterministic jitter so results aren't all identical
    const hash = scheme.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    score += (hash % 7) - 3

    score = Math.max(38, Math.min(98, score))

    return { ...scheme, matchScore: score }
  })

  return scored.sort((a, b) => b.matchScore - a.matchScore)
}

export function getTopRecommendations(profile: UserProfile, count = 6): SchemeMatch[] {
  return getRecommendations(profile).slice(0, count)
}
