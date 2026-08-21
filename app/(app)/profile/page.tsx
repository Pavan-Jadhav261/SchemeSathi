"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, LogOut, Sparkles, UserRound } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { clearAuthUser, getAuthUser, getProfile, getSavedSchemes, saveProfile, setAuthUser, type AuthUser } from "@/lib/storage"
import type { UserProfile } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile>({})
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    setUser(getAuthUser())
    setProfile(getProfile())
    setSavedCount(getSavedSchemes().length)
  }, [])

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U"

  function handleSave() {
    if (user) setAuthUser(user)
    saveProfile(profile)
    toast.success("Profile updated")
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 lg:px-12">
      <div className="reveal">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground text-balance">Your profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account details and the information used to match you to schemes.
        </p>
      </div>

      <div className="reveal neu-card mt-6 flex flex-col items-center gap-3 rounded-3xl p-7 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Avatar className="size-16">
            <AvatarFallback className="bg-accent text-lg font-bold text-accent-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-heading text-lg font-bold text-foreground">{user?.name ?? "Guest User"}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? "Not signed in"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-accent px-4 py-2.5 text-accent-foreground">
          <Sparkles className="size-4" />
          <span className="text-sm font-semibold">
            {savedCount} saved {savedCount === 1 ? "scheme" : "schemes"}
          </span>
        </div>
      </div>

      <div className="reveal neu-card mt-6 flex flex-col gap-6 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2.5">
          <UserRound className="size-4.5 text-muted-foreground" />
          <h2 className="font-heading text-lg font-bold text-foreground">Account details</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={user?.name ?? ""}
              onChange={(e) => setUser((u) => ({ id: u?.id ?? "", name: e.target.value, email: u?.email ?? "" }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ""}
              onChange={(e) => setUser((u) => ({ id: u?.id ?? "", name: u?.name ?? "", email: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={profile.state ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={profile.age ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-5">
          <Button variant="outline" render={<Link href="/find-scheme" />} nativeButton={false}>
            Update matching profile
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button onClick={handleSave} className="font-semibold">
            Save changes
          </Button>
        </div>
      </div>

      <Button
        variant="ghost"
        className="mt-6 text-muted-foreground"
        onClick={() => {
          clearAuthUser()
          router.push("/")
        }}
      >
        <LogOut data-icon="inline-start" />
        Log out
      </Button>
    </div>
  )
}
