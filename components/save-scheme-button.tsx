"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isSchemeSaved, toggleSavedScheme } from "@/lib/storage"
import { cn } from "@/lib/utils"

export function SaveSchemeButton({ schemeId, matchScore }: { schemeId: string; matchScore?: number }) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isSchemeSaved(schemeId))
  }, [schemeId])

  return (
    <Button
      variant="outline"
      className="shrink-0"
      onClick={() => setSaved(toggleSavedScheme(schemeId, matchScore))}
      aria-pressed={saved}
    >
      <Heart className={cn("size-4 transition-all", saved && "fill-saffron text-saffron")} data-icon="inline-start" />
      {saved ? "Saved" : "Save scheme"}
    </Button>
  )
}
