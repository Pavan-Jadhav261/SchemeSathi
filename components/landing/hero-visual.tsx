import { Sparkles, FileCheck2, Landmark, Wheat, CheckCircle2 } from "lucide-react"

export function HeroVisual() {
  return (
    <div className="relative mx-auto flex h-[420px] w-full max-w-md items-center justify-center sm:h-[480px]">
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-ai-blue/10 via-transparent to-saffron/10" />

      {/* Central AI avatar */}
      <div className="neu-card relative z-10 flex size-40 flex-col items-center justify-center rounded-[2.5rem] sm:size-48">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-md sm:size-20">
          <Sparkles className="size-8 sm:size-9" />
        </span>
        <p className="mt-3 text-center text-xs font-semibold text-muted-foreground">Analyzing your profile…</p>
      </div>

      {/* Floating scheme card - top left */}
      <div
        className="neu-card absolute left-0 top-4 z-20 flex w-44 animate-[float_6s_ease-in-out_infinite] items-center gap-3 rounded-2xl p-3 sm:top-6"
        style={{ animationDelay: "0s" }}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-scheme-green/15 text-scheme-green">
          <Wheat className="size-4.5" />
        </span>
        <div className="overflow-hidden">
          <p className="truncate text-xs font-semibold text-foreground">PM-KISAN</p>
          <p className="text-[0.65rem] text-muted-foreground">94% eligible</p>
        </div>
      </div>

      {/* Floating eligibility badge - top right */}
      <div
        className="neu-card absolute right-0 top-16 z-20 flex animate-[float_7s_ease-in-out_infinite] items-center gap-2 rounded-2xl px-3.5 py-2.5 sm:top-20"
        style={{ animationDelay: "1.2s" }}
      >
        <CheckCircle2 className="size-4 text-scheme-green" />
        <p className="text-xs font-semibold text-foreground">You may be eligible</p>
      </div>

      {/* Floating document card - bottom left */}
      <div
        className="neu-card absolute bottom-10 left-2 z-20 flex animate-[float_6.5s_ease-in-out_infinite] items-center gap-2 rounded-2xl px-3 py-2.5 sm:bottom-14"
        style={{ animationDelay: "0.6s" }}
      >
        <FileCheck2 className="size-4 text-ai-blue-foreground" />
        <p className="text-xs font-semibold text-foreground">Aadhaar verified</p>
      </div>

      {/* Floating scheme card - bottom right */}
      <div
        className="neu-card absolute bottom-0 right-2 z-20 flex w-40 animate-[float_5.5s_ease-in-out_infinite] items-center gap-3 rounded-2xl p-3 sm:right-4"
        style={{ animationDelay: "1.8s" }}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-saffron/15 text-saffron">
          <Landmark className="size-4.5" />
        </span>
        <div className="overflow-hidden">
          <p className="truncate text-xs font-semibold text-foreground">PM Awas Yojana</p>
          <p className="text-[0.65rem] text-muted-foreground">78% match</p>
        </div>
      </div>

      {/* Connecting dots */}
      <svg className="pointer-events-none absolute inset-0 z-0 size-full opacity-40" aria-hidden="true">
        <line x1="20%" y1="20%" x2="45%" y2="45%" stroke="var(--ai-blue)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="80%" y1="30%" x2="55%" y2="48%" stroke="var(--saffron)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="20%" y1="80%" x2="45%" y2="55%" stroke="var(--scheme-green)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="80%" y1="85%" x2="55%" y2="55%" stroke="var(--ai-blue)" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
    </div>
  )
}
