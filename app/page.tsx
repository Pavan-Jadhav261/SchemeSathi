import Link from "next/link"
import { ArrowRight, Compass, ShieldCheck, Sparkles, UserSearch, FileCheck2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { HeroVisual } from "@/components/landing/hero-visual"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CategoryGrid } from "@/components/landing/category-grid"

const trustIndicators = [
  { icon: Compass, label: "Government scheme discovery" },
  { icon: UserSearch, label: "Personalized recommendations" },
  { icon: Sparkles, label: "Eligibility assistance" },
  { icon: FileCheck2, label: "Official application links" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div className="reveal">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="size-3.5 text-scheme-green" />
                Trusted, AI-guided scheme discovery
              </div>
              <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground text-balance sm:text-5xl lg:text-[3.4rem]">
                Find the Government Schemes You&apos;re Eligible For.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Tell us about yourself. Our AI helps you discover relevant government schemes, understand
                eligibility, find required documents, and navigate to the official application portal.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 px-6 text-base font-semibold shadow-md"
                  render={<Link href="/find-scheme" />}
                  nativeButton={false}
                >
                  Find My Schemes
                  <ArrowRight data-icon="inline-end" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 text-base font-semibold"
                  render={<Link href="/schemes" />}
                  nativeButton={false}
                >
                  Explore Schemes
                </Button>
              </div>
            </div>

            <div className="reveal" style={{ animationDelay: "0.1s" }}>
              <HeroVisual />
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {trustIndicators.map((item) => (
                <div
                  key={item.label}
                  className="neu-card flex flex-col items-center gap-2.5 rounded-2xl px-3 py-5 text-center transition-transform duration-300 hover:-translate-y-1"
                >
                  <item.icon className="size-5 text-ai-blue-foreground" />
                  <span className="text-xs font-semibold leading-snug text-foreground sm:text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />
        <CategoryGrid />

        {/* About */}
        <section id="about" className="mx-auto max-w-4xl px-4 py-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            SchemeSathi analyzes publicly available government scheme information to help you understand what you
            may be eligible for. We are an independent information and discovery assistant, not a government
            website — every scheme links you to its official source for verification and application.
          </p>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="neu-card relative overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-14">
            <div className="absolute inset-0 bg-gradient-to-br from-saffron/10 via-transparent to-scheme-green/10" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
                Your benefits shouldn&apos;t be hidden behind complicated forms.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                Tell us about yourself. We&apos;ll help you discover government schemes that may be right for you.
              </p>
              <Button
                size="lg"
                className="mt-8 h-12 px-7 text-base font-semibold shadow-md"
                render={<Link href="/find-scheme" />}
                nativeButton={false}
              >
                Find My Schemes
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
