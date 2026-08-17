import { Badge } from "@/components/ui/badge"
import type { ScreeningStatus } from "@/data/mock"

const labels: Record<ScreeningStatus, string> = {
  compliant: "Compliant",
  non_compliant: "Non-compliant",
  under_review: "Under review",
}

export function StatusBadge({ status }: { status: ScreeningStatus }) {
  if (status === "compliant") {
    return (
      <Badge className="bg-gain/15 text-gain border-transparent">
        {labels[status]}
      </Badge>
    )
  }
  if (status === "non_compliant") {
    return (
      <Badge variant="destructive">{labels[status]}</Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      {labels[status]}
    </Badge>
  )
}
