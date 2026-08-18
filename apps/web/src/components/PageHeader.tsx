import type { ReactNode } from "react"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {description ? <p className="kicker">{description}</p> : null}
        <h1 className="font-heading text-3xl font-semibold tracking-tight uppercase">
          {title}
        </h1>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}
