"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Sparkles, User, Mail, Phone, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { setAuthUser } from "@/lib/storage"

export default function SignupPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const response = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fullName, email, mobile, password }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to create the account.")
      setAuthUser(result.user, result.token)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the account.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-scheme-green/5 via-transparent to-saffron/5" />

      <div className="reveal relative z-10 w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4.5" />
          </span>
          <span className="font-heading text-lg font-bold text-foreground">SchemeSathi</span>
        </Link>

        <div className="neu-card rounded-[2rem] p-8">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-foreground">Create your account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Takes less than a minute — no documents required to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    required
                    placeholder="Asha Devi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 rounded-xl pl-10 transition-shadow focus-visible:shadow-[0_0_0_4px_var(--ring)]"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl pl-10 transition-shadow focus-visible:shadow-[0_0_0_4px_var(--ring)]"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="mobile">Mobile Number</FieldLabel>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="mobile"
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
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
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl pl-10 transition-shadow focus-visible:shadow-[0_0_0_4px_var(--ring)]"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 rounded-xl pl-10 transition-shadow focus-visible:shadow-[0_0_0_4px_var(--ring)]"
                  />
                </div>
              </Field>

              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

              <Button type="submit" size="lg" className="h-12 font-semibold" disabled={submitting}>
                {submitting ? "Creating your account…" : "Create Account"}
              </Button>
            </FieldGroup>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-foreground hover:underline">
              Log in
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}
