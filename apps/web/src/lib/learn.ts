import { learningUnits } from "@/data/mock"

const nodes = learningUnits.flatMap((unit) => unit.nodes)

export function getLearningProgress() {
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
  const currentNode =
    currentUnit?.nodes.find((node) => node.status === "current") ??
    currentUnit?.nodes.find((node) => node.status === "locked") ??
    null
  const pct = nodes.length === 0 ? 0 : Math.round((completed / nodes.length) * 100)

  return {
    completed,
    total: nodes.length,
    earnedXp,
    currentUnit,
    currentNode,
    pct,
  }
}
