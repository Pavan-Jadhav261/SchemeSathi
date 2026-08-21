"use client"

import Link from "next/link"
import {
  Wheat,
  GraduationCap,
  Users,
  HeartPulse,
  Briefcase,
  Home,
  Users2,
  PiggyBank,
  Rocket,
  Accessibility,
} from "lucide-react"
import { categories } from "@/lib/categories-data"

const icons: Record<string, typeof Wheat> = {
  Wheat,
  GraduationCap,
  Users,
  HeartPulse,
  Briefcase,
  Home,
  Users2,
  PiggyBank,
  Rocket,
  Accessibility,
}

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-scheme-green">Browse by category</p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
          Schemes for every walk of life.
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => {
          const Icon = icons[category.icon] ?? Wheat
          return (
            <Link
              key={category.id}
              href={`/schemes?category=${category.id}`}
              className="neu-card group flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Icon className="size-5.5" />
              </span>
              <span className="text-sm font-semibold text-foreground">{category.label}</span>
              <span className="text-[0.68rem] text-muted-foreground transition-opacity duration-300 group-hover:opacity-0">
                {category.schemeCount} schemes
              </span>
              <span className="grid grid-rows-[0fr] text-[0.68rem] leading-relaxed text-muted-foreground transition-all duration-300 group-hover:grid-rows-[1fr] group-hover:-mt-4">
                <span className="overflow-hidden">{category.description}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
