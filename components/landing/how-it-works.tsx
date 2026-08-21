import { UserRoundPen, Sparkles, ScrollText, BadgeCheck } from "lucide-react"

const steps = [
  {
    icon: UserRoundPen,
    title: "Tell Us About You",
    description: "Share basic information about your age, occupation, income, location and other relevant details.",
  },
  {
    icon: Sparkles,
    title: "AI Finds Relevant Schemes",
    description: "Our intelligent recommendation engine analyzes your information and finds schemes that match your profile.",
  },
  {
    icon: ScrollText,
    title: "Understand the Benefits",
    description: "Ask questions about eligibility, benefits, required documents and application procedures.",
  },
  {
    icon: BadgeCheck,
    title: "Apply With Confidence",
    description: "Access the official government website and application portal.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-saffron">How it works</p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
          From your situation to the right scheme, in four simple steps.
        </h2>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="neu-card group relative flex flex-col gap-4 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5"
          >
            <span className="font-heading text-4xl font-bold text-foreground/10">{String(i + 1).padStart(2, "0")}</span>
            <span className="-mt-2 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-110">
              <step.icon className="size-5.5" />
            </span>
            <h3 className="font-heading text-base font-bold text-foreground">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
