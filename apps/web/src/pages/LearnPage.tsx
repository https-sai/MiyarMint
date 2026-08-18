import { PageHeader } from "@/components/PageHeader"
import { LearningPath } from "@/components/learn/LearningPath"
import { articles, learningUnits } from "@/data/mock"

const nodes = learningUnits.flatMap((unit) => unit.nodes)
const completed = nodes.filter(
  (node) => node.status === "complete" || node.status === "claimed",
).length
const earnedXp = nodes.reduce((sum, node) => {
  if (node.status === "complete" || node.status === "claimed") return sum + node.xp
  if (node.status === "current") {
    return sum + Math.round(node.xp * ((node.progress ?? 0) / 100))
  }
  return sum
}, 0)
const currentUnit =
  learningUnits.find((unit) => unit.nodes.some((node) => node.status === "current")) ??
  learningUnits[0]

export function LearnPage() {
  return (
    <div className="relative mx-auto flex max-w-4xl flex-col gap-8 overflow-x-visible">
      <PageHeader
        title="Learn"
        description="Follow the path · tap a step to continue"
        actions={
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-400 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.14em] text-amber-950 uppercase shadow-[0_3px_0_#b45309]">
              {earnedXp} XP
            </span>
            <span className="rounded-full bg-teal-400 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.14em] text-teal-950 uppercase shadow-[0_3px_0_#0f766e]">
              {completed}/{nodes.length}
            </span>
          </div>
        }
      />

      {currentUnit ? (
        <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
          Now in unit {currentUnit.number} · {currentUnit.title}
        </p>
      ) : null}

      <LearningPath />

      <section id="learn-reading" className="border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="kicker">Guidebook</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Reading</h2>
        </div>
        <div className="divide-y divide-border">
          {articles.map((article) => (
            <div
              key={article.title}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div>
                <p className="font-medium">{article.title}</p>
                <p className="text-sm text-muted-foreground">{article.source}</p>
              </div>
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                {article.read}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
