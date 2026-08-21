"use client"

import type { ChatMessage, RecentSearch, SavedScheme, SchemeMatch, UserProfile } from "./types"

const KEYS = {
  profile: "schemesathi:profile",
  saved: "schemesathi:saved",
  recent: "schemesathi:recent-searches",
  auth: "schemesathi:auth-user",
  token: "schemesathi:access-token",
  recommendations: "schemesathi:recommendations",
} as const

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getProfile(): UserProfile {
  return read<UserProfile>(KEYS.profile, {})
}

export function saveProfile(profile: UserProfile) {
  write(KEYS.profile, profile)
}

type RecommendationCache = { profile: string; matches: SchemeMatch[]; usingAi: boolean; savedAt: string }

export function getRecommendationCache(profile: UserProfile): RecommendationCache | null {
  const cached = read<RecommendationCache[] | RecommendationCache>(KEYS.recommendations, [])
  const caches = Array.isArray(cached) ? cached : [cached]
  return caches.find((cache) => cache.profile === JSON.stringify(profile)) ?? null
}

export function saveRecommendationCache(profile: UserProfile, matches: SchemeMatch[], usingAi: boolean) {
  const cached = read<RecommendationCache[] | RecommendationCache>(KEYS.recommendations, [])
  const caches = Array.isArray(cached) ? cached : [cached]
  const entry: RecommendationCache = { profile: JSON.stringify(profile), matches, usingAi, savedAt: new Date().toISOString() }
  write(KEYS.recommendations, [entry, ...caches.filter((cache) => cache.profile !== entry.profile)].slice(0, 10))
}

const chatKey = (schemeId: string) => `schemesathi:scheme-chat:${schemeId}`

export function getSchemeChatHistory(schemeId: string): ChatMessage[] {
  return read<ChatMessage[]>(chatKey(schemeId), [])
}

export function saveSchemeChatHistory(schemeId: string, messages: ChatMessage[]) {
  write(chatKey(schemeId), messages.slice(-50))
}

export function getSavedSchemes(): SavedScheme[] {
  return read<SavedScheme[]>(KEYS.saved, [])
}

export function isSchemeSaved(schemeId: string): boolean {
  return getSavedSchemes().some((s) => s.schemeId === schemeId)
}

export function toggleSavedScheme(schemeId: string, matchScore?: number): boolean {
  const saved = getSavedSchemes()
  const existingIndex = saved.findIndex((s) => s.schemeId === schemeId)
  if (existingIndex >= 0) {
    saved.splice(existingIndex, 1)
    write(KEYS.saved, saved)
    return false
  }
  saved.push({ schemeId, savedAt: new Date().toISOString(), matchScore })
  write(KEYS.saved, saved)
  return true
}

export function removeSavedScheme(schemeId: string) {
  const saved = getSavedSchemes().filter((s) => s.schemeId !== schemeId)
  write(KEYS.saved, saved)
}

export function getRecentSearches(): RecentSearch[] {
  return read<RecentSearch[]>(KEYS.recent, [])
}

export function addRecentSearch(query: string) {
  const searches = getRecentSearches()
  const entry: RecentSearch = { id: crypto.randomUUID(), query, searchedAt: new Date().toISOString() }
  const updated = [entry, ...searches].slice(0, 10)
  write(KEYS.recent, updated)
}

export type AuthUser = { id: string; name: string; email: string }

export function getAuthUser(): AuthUser | null {
  return read(KEYS.auth, null as AuthUser | null)
}

export function setAuthUser(user: AuthUser, token?: string) {
  write(KEYS.auth, user)
  if (token) write(KEYS.token, token)
}

export function getAccessToken(): string | null {
  return read(KEYS.token, null as string | null)
}

export function clearAuthUser() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KEYS.auth)
  window.localStorage.removeItem(KEYS.token)
}
