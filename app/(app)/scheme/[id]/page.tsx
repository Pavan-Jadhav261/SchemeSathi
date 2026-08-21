import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DocumentCard } from "@/components/document-card"
import { AiChatPanel } from "@/components/ai-chat-panel"
import { SaveSchemeButton } from "@/components/save-scheme-button"
import { getSchemeById } from "@/lib/schemes-data"
import { getCategoryById } from "@/lib/categories-data"

export default async function SchemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const scheme = getSchemeById(id)
  if (!scheme) notFound()

  const category = getCategoryById(scheme.category)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:px-12">
      <Button variant="ghost" size="sm" render={<Link href="/schemes" />} nativeButton={false} className="mb-6 -ml-2">
        <ArrowLeft data-icon="inline-start" />
        Back to schemes
      </Button>

      {/* Header */}
      <div className="reveal neu-card flex flex-col gap-5 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-3 bg-accent text-accent-foreground">
              {category?.label ?? scheme.category}
            </Badge>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
              {scheme.name}
            </h1>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {scheme.department} · {scheme.state}
            </p>
          </div>
          <SaveSchemeButton schemeId={scheme.id} />
        </div>

        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{scheme.overview}</p>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            className="h-11 bg-saffron px-5 font-semibold text-saffron-foreground hover:bg-saffron/90"
            render={<a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" />}
            nativeButton={false}
          >
            Apply on official portal
            <ExternalLink data-icon="inline-end" />
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-8">
          {/* Description */}
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">About this scheme</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{scheme.description}</p>
            <div className="mt-4 neu-inset flex flex-col gap-1 rounded-2xl px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-medium text-muted-foreground">Benefit</span>
              <span className="font-heading text-base font-bold text-foreground">
                {scheme.benefitAmount ?? scheme.benefit}
              </span>
            </div>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">Eligibility criteria</h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {scheme.eligibility.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="size-4 shrink-0 text-scheme-green" />
                  {item.label}
                </li>
              ))}
            </ul>
          </section>

          {/* Documents */}
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">Documents you&apos;ll need</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {scheme.documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          </section>

          {/* Application steps */}
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">How to apply</h2>
            <ol className="mt-3 flex flex-col gap-3">
              {scheme.applicationSteps.map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[0.7rem] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-sm leading-relaxed text-foreground">{step}</span>
                </li>
              ))}
            </ol>
            <Button
              variant="outline"
              className="mt-4"
              render={<a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" />}
              nativeButton={false}
            >
              Go to official portal
              <ArrowUpRight data-icon="inline-end" />
            </Button>
          </section>

          {/* Source */}
          <section className="neu-inset flex items-start gap-3 rounded-2xl px-4 py-4">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-scheme-green" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Source: {scheme.source.department}. Information last verified on{" "}
              {new Date(scheme.source.lastVerified).toLocaleDateString()}. Always confirm current details on the{" "}
              <a
                href={scheme.source.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline underline-offset-2"
              >
                official government source
              </a>
              .
            </p>
          </section>
        </div>

        {/* AI chat sidebar */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <AiChatPanel scheme={scheme} />
        </div>
      </div>
    </div>
  )
}
