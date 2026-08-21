"use client"

import { cn } from "@/lib/utils"

export function MatchRing({
  score,
  size = 56,
  className,
}: {
  score: number
  size?: number
  className?: string
}) {
  const radius = size / 2 - 4
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)

  const color = score >= 80 ? "var(--scheme-green)" : score >= 60 ? "var(--saffron)" : "var(--ai-blue)"

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${score}% match`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-heading text-[0.8rem] font-bold text-foreground">{score}%</span>
    </div>
  )
}
