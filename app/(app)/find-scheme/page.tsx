"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sparkles, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import { saveProfile, addRecentSearch } from "@/lib/storage"
import type { UserProfile } from "@/lib/types"

const STEPS = ["About you", "Occupation", "Income & category", "Anything else?"]

const STATES = [
  "Andhra Pradesh",
  "Bihar",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
]

export default function FindSchemePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [processing, setProcessing] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    age: "",
    gender: "",
    state: "Maharashtra",
    district: "",
    occupationType: "employee",
    annualIncome: "",
    bplStatus: "no",
    landOwnership: "",
    landSize: "",
    cropType: "",
    educationLevel: "",
    course: "",
    query: "",
  })

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }))
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }
    setProcessing(true)
    saveProfile(profile)
    if (profile.query?.trim()) addRecentSearch(profile.query.trim())
    setTimeout(() => {
      router.push("/recommendations")
    }, 2200)
  }

  const progressPct = ((step + 1) / STEPS.length) * 100

  if (processing) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="relative flex size-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-ai-blue/30" />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-ai-blue text-ai-blue-foreground">
            <Sparkles className="size-7" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-xl font-bold text-foreground">
            Matching your profile to government schemes…
          </h2>
          <p className="text-sm text-muted-foreground">
            Scanning eligibility rules across 250+ central and state schemes
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          <span>This usually takes a few seconds</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-ai-blue">
          <Sparkles className="size-3.5" />
          AI Scheme Finder
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {STEPS[step]}
        </h1>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-saffron transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      <div className="neu-card rounded-3xl p-6 sm:p-8">
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                placeholder="e.g. Priya Sharma"
                value={profile.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="28"
                  value={profile.age}
                  onChange={(e) => update("age", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={profile.gender} onValueChange={(v) => update("gender", v)}>
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="state">State / UT</Label>
              <Select value={profile.state} onValueChange={(v) => update("state", v)}>
                <SelectTrigger id="state" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="occupationType">What best describes you?</Label>
              <Select
                value={profile.occupationType}
                onValueChange={(v) => update("occupationType", v as UserProfile["occupationType"])}
              >
                <SelectTrigger id="occupationType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="business-owner">Business owner / entrepreneur</SelectItem>
                    <SelectItem value="employee">Salaried employee</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {profile.occupationType === "farmer" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="landOwnership">Land ownership</Label>
                  <Input
                    id="landOwnership"
                    placeholder="Own / Leased"
                    value={profile.landOwnership}
                    onChange={(e) => update("landOwnership", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="landSize">Land size (acres)</Label>
                  <Input
                    id="landSize"
                    placeholder="e.g. 2.5"
                    value={profile.landSize}
                    onChange={(e) => update("landSize", e.target.value)}
                  />
                </div>
              </div>
            )}

            {profile.occupationType === "student" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="educationLevel">Education level</Label>
                  <Input
                    id="educationLevel"
                    placeholder="e.g. Undergraduate"
                    value={profile.educationLevel}
                    onChange={(e) => update("educationLevel", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    placeholder="e.g. B.Sc"
                    value={profile.course}
                    onChange={(e) => update("course", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="income">Annual household income (₹)</Label>
              <Input
                id="income"
                type="number"
                min={0}
                step={5000}
                placeholder="150000"
                value={profile.annualIncome}
                onChange={(e) => update("annualIncome", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bpl">Do you hold a BPL / ration card?</Label>
              <Select value={profile.bplStatus} onValueChange={(v) => update("bplStatus", v)}>
                <SelectTrigger id="bpl" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="not-sure">Not sure</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            <Label htmlFor="query">Tell us more about your situation (optional)</Label>
            <Textarea
              id="query"
              rows={5}
              placeholder="e.g. I'm a small farmer looking for crop insurance and irrigation support..."
              value={profile.query}
              onChange={(e) => update("query", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The more detail you share, the better our AI can match you to relevant schemes.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft data-icon="inline-start" />
          Back
        </Button>
        <Button onClick={handleNext} className="bg-saffron text-saffron-foreground hover:bg-saffron/90">
          {step === STEPS.length - 1 ? "Find my schemes" : "Continue"}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}
