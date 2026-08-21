import { FileText, IdCard, Landmark, ScrollText, Home, BadgeCheck, Camera, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { RequiredDocument } from "@/lib/types"

const iconMap: Record<string, typeof FileText> = {
  aadhaar: IdCard,
  income: ScrollText,
  bank: Landmark,
  land: Home,
  residence: Home,
  ration: BadgeCheck,
  photo: Camera,
  birth: FileText,
  marksheet: FileText,
  "business-plan": FileText,
  mobile: Phone,
}

export function DocumentCard({ document }: { document: RequiredDocument }) {
  const Icon = iconMap[document.id] ?? FileText

  return (
    <div className="neu-card flex flex-col gap-3 rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-ai-blue/15 text-ai-blue-foreground">
          <Icon className="size-5" />
        </span>
        <Badge variant={document.required ? "default" : "secondary"} className="text-[0.65rem]">
          {document.required ? "Required" : "Optional"}
        </Badge>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground">{document.name}</h4>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{document.reason}</p>
      </div>
    </div>
  )
}
