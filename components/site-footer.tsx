import Link from "next/link"
import { Sparkles, ShieldCheck } from "lucide-react"

const columns = [
  {
    title: "Product",
    links: [
      { label: "Home", href: "/" },
      { label: "Find Schemes", href: "/find-scheme" },
      { label: "Explore Schemes", href: "/schemes" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="size-4.5" />
              </span>
              <span className="font-heading text-lg font-bold text-foreground">SchemeSathi</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Government schemes, simplified. An AI-powered discovery assistant that helps you understand eligibility,
              benefits and documents before you apply.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-scheme-green" />
              Independent information assistant
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SchemeSathi. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">
            SchemeSathi is an independent information assistant and is not an official government website.
          </p>
        </div>
      </div>
    </footer>
  )
}
