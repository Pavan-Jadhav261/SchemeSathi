"use client"

import type { RecentSearch, SavedScheme, UserProfile } from "./types"

const KEYS = {
  profile: "schemesathi:profile",
  saved: "schemesathi:saved",
  recent: "schemesathi:recent-searches",
  auth: "schemesathi:auth-user",
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

export function getAuthUser(): { name: string; email: string } | null {
  return read(KEYS.auth, null as { name: string; email: string } | null)
}

export function setAuthUser(user: { name: string; email: string }) {
  write(KEYS.auth, user)
}

export function clearAuthUser() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KEYS.auth)
}
