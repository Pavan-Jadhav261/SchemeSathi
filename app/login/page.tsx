"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Sparkles, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { setAuthUser } from "@/lib/storage"

export default function LoginPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [identifier, setIdentifier] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const name = identifier.includes("@") ? identifier.split("@")[0] : "Citizen"
    setAuthUser({ name: name.charAt(0).toUpperCase() + name.slice(1), email: identifier || "you@example.com" })
    setTimeout(() => router.push("/dashboard"), 500)
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ai-blue/5 via-transparent to-saffron/5" />

      <div className="reveal relative z-10 w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4.5" />
          </span>
          <span className="font-heading text-lg font-bold text-foreground">SchemeSathi</span>
        </Link>

        <div className="neu-card rounded-[2rem] p-8">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Log in to see your saved schemes and recommendations.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="identifier">Email or Mobile Number</FieldLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="identifier"
                    type="text"
                    required
                    placeholder="you@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="h-12 rounded-xl pl-10 transition-shadow focus-visible:shadow-[0_0_0_4px_var(--ring)]"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="h-12 rounded-xl pl-10 transition-shadow focus-visible:shadow-[0_0_0_4px_var(--ring)]"
                  />
                </div>
              </Field>

              <Button type="submit" size="lg" className="h-12 font-semibold" disabled={submitting}>
                {submitting ? "Logging in…" : "Login"}
              </Button>
            </FieldGroup>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-foreground hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This is a demo experience — any details will sign you in.
        </p>
      </div>
    </main>
  )
}
