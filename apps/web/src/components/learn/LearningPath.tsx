import { useEffect, useMemo, useState, type CSSProperties } from "react"
import {
  BookOpen,
  Crown,
  Lock,
  PieChart,
  Search,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  TrendingUp,
  Wallet,
} from "lucide-react"

import { MintBuddy } from "@/components/learn/MintBuddy"
import type {
  LearningPathNode,
  LearningUnit,
  PathIcon,
  PathTheme,
} from "@/data/mock"
import { learningUnits } from "@/data/mock"
import { cn } from "@/lib/utils"

const COL = 360
const CENTER = COL / 2
const AMP = 52
const GAP = 124
const PAD_TOP = 64
const WAVE = [0, 1, 2, 1, 0, -1, -2, -1]

const themes: Record<
  PathTheme,
  {
    banner: string
    face: string
    lip: string
    path: string
    ring: string
    glow: string
    popup: string
  }
> = {
  mint: {
    banner: "from-teal-400 to-emerald-500",
    face: "#2dd4bf",
    lip: "#0f766e",
    path: "#2dd4bf",
    ring: "rgba(45, 212, 191, 0.45)",
    glow: "rgba(45, 212, 191, 0.18)",
    popup: "#0d9488",
  },
  gold: {
    banner: "from-amber-400 to-yellow-500",
    face: "#fbbf24",
    lip: "#b45309",
    path: "#fbbf24",
    ring: "rgba(251, 191, 36, 0.45)",
    glow: "rgba(251, 191, 36, 0.16)",
    popup: "#d97706",
  },
  violet: {
    banner: "from-violet-400 to-fuchsia-500",
    face: "#c084fc",
    lip: "#6d28d9",
    path: "#c084fc",
    ring: "rgba(192, 132, 252, 0.45)",
    glow: "rgba(192, 132, 252, 0.16)",
    popup: "#7c3aed",
  },
}

function offsetX(index: number) {
  return WAVE[index % WAVE.length] * AMP
}

function nodePositions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: CENTER + offsetX(i),
    y: PAD_TOP + i * GAP,
  }))
}

function curvePath(points: { x: number; y: number }[]) {
  if (points.length === 0) return ""
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const midY = (prev.y + curr.y) / 2
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`
  }
  return d
}

function NodeIcon({
  icon,
  className,
}: {
  icon: PathIcon
  className?: string
}) {
  const props = { className: cn("size-7", className), strokeWidth: 2.4 }
  switch (icon) {
    case "shield":
      return <ShieldCheck {...props} />
    case "wallet":
      return <Wallet {...props} />
    case "chart":
      return <TrendingUp {...props} />
    case "pie":
      return <PieChart {...props} />
    case "trophy":
      return <Trophy {...props} />
    case "search":
      return <Search {...props} />
    case "target":
      return <Target {...props} />
    case "crown":
      return <Crown {...props} />
    default:
      return <Star {...props} />
  }
}

function TreasureChest({
  claimed,
  wiggle,
}: {
  claimed: boolean
  wiggle?: boolean
}) {
  return (
    <svg
      viewBox="0 0 64 56"
      className={cn("size-10", wiggle && "animate-chest-wiggle")}
      aria-hidden
    >
      {claimed ? (
        <>
          <path d="M8 22 Q32 2 56 22 L56 26 H8Z" fill="#fbbf24" />
          <rect x="8" y="24" width="48" height="24" rx="4" fill="#d97706" />
          <rect x="8" y="24" width="48" height="8" fill="#f59e0b" />
          <rect x="28" y="30" width="8" height="10" rx="2" fill="#fde68a" />
          <path
            d="M32 18 L34 12 L36 18 L42 20 L36 22 L34 28 L32 22 L26 20Z"
            fill="#fde68a"
          />
        </>
      ) : (
        <>
          <path d="M6 20 Q32 6 58 20 V26 H6Z" fill="#f59e0b" />
          <rect x="6" y="24" width="52" height="26" rx="5" fill="#d97706" />
          <rect x="6" y="24" width="52" height="9" fill="#fbbf24" />
          <rect x="28" y="31" width="8" height="11" rx="2" fill="#78350f" />
          <circle cx="32" cy="35" r="2" fill="#fde68a" />
        </>
      )}
    </svg>
  )
}

function Bush({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 72 40"
      className={cn("h-8 w-14", className)}
      style={style}
      aria-hidden
    >
      <ellipse cx="22" cy="28" rx="16" ry="12" fill="#134e4a" />
      <ellipse cx="44" cy="26" rx="18" ry="14" fill="#115e59" />
      <ellipse cx="34" cy="22" rx="12" ry="10" fill="#0f766e" />
    </svg>
  )
}

function Coin({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      className={cn(
        "animate-float-coin inline-flex size-7 items-center justify-center rounded-full bg-gradient-to-b from-amber-200 to-amber-500 font-mono text-[10px] font-bold text-amber-950 shadow-[0_3px_0_#b45309]",
        className,
      )}
      style={style}
      aria-hidden
    >
      XP
    </span>
  )
}

function PathNodeButton({
  node,
  theme,
  current,
  shaking,
  selected,
  delay,
  onClick,
}: {
  node: LearningPathNode
  theme: (typeof themes)[PathTheme]
  current: boolean
  shaking: boolean
  selected: boolean
  delay: number
  onClick: () => void
}) {
  const locked = node.status === "locked"
  const complete = node.status === "complete" || node.status === "claimed"
  const isChest = node.type === "chest"
  const face = locked ? "#475569" : complete && isChest ? "#f59e0b" : theme.face
  const lip = locked ? "#1e293b" : complete && isChest ? "#b45309" : theme.lip

  return (
    <div
      className={cn(
        current && "z-10 scale-110",
        shaking && "animate-node-shake",
      )}
    >
    <button
      type="button"
      data-path-node
      onClick={onClick}
      aria-current={current ? "step" : undefined}
      aria-label={node.title}
      className="animate-path-node-in group relative size-[70px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {current ? (
        <>
          <span
            className="animate-ring-pulse pointer-events-none absolute -inset-2 rounded-full border-2"
            style={{ borderColor: theme.ring }}
          />
          <span
            className="animate-ring-pulse pointer-events-none absolute -inset-2 rounded-full border-2 [animation-delay:0.7s]"
            style={{ borderColor: theme.ring }}
          />
        </>
      ) : null}

      <span
        className="absolute inset-x-0 top-2 bottom-[-7px] rounded-full"
        style={{ background: lip }}
      />
      <span
        className={cn(
          "relative z-10 flex size-full items-center justify-center rounded-full text-white transition-transform group-active:translate-y-[6px]",
          selected && !locked && "ring-4 ring-white/35",
        )}
        style={{
          background: face,
          boxShadow: current
            ? `inset 0 -6px 0 rgba(0,0,0,0.12), 0 0 24px ${theme.glow}`
            : "inset 0 -6px 0 rgba(0,0,0,0.14)",
        }}
      >
        {isChest ? (
          <TreasureChest claimed={node.status === "claimed"} wiggle={current} />
        ) : locked ? (
          <Lock className="size-7 text-slate-300" strokeWidth={2.4} />
        ) : complete ? (
          <Star className="size-8 fill-white text-white" />
        ) : (
          <NodeIcon icon={node.icon} className="size-8 text-white" />
        )}
      </span>
    </button>
    </div>
  )
}

function NodePopover({
  node,
  theme,
  side,
  onClose,
}: {
  node: LearningPathNode
  theme: (typeof themes)[PathTheme]
  side: "left" | "right"
  onClose: () => void
}) {
  const locked = node.status === "locked"
  const cta =
    node.status === "complete" || node.status === "claimed"
      ? "Review"
      : node.status === "current"
        ? node.progress && node.progress > 0
          ? "Continue"
          : "Start"
        : "Locked"
  const fill = locked ? "#334155" : theme.popup

  return (
    <div
      data-path-popover
      className={cn(
        "absolute top-1/2 z-30 w-56 -translate-y-1/2",
        side === "right"
          ? "left-[calc(100%+18px)]"
          : "right-[calc(100%+18px)]",
      )}
      role="dialog"
      aria-label={node.title}
    >
      <div
        className={cn(
          "absolute top-1/2 size-3.5 -translate-y-1/2 rotate-45",
          side === "right" ? "-left-1.5" : "-right-1.5",
        )}
        style={{ background: fill }}
      />
      <div
        className="relative rounded-2xl px-4 py-3.5 text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
        style={{ background: fill }}
      >
        <p className="text-[13px] leading-snug font-semibold">{node.title}</p>
        <p className="mt-1 font-mono text-[10px] tracking-[0.12em] text-white/75 uppercase">
          {node.minutes ? `${node.minutes} min · ` : ""}+{node.xp} XP
          {node.track ? ` · ${node.track}` : ""}
        </p>
        {node.status === "current" && node.progress ? (
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-black/25">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${node.progress}%` }}
            />
          </div>
        ) : null}
        <button
          type="button"
          disabled={locked}
          onClick={onClose}
          className="mt-3 w-full rounded-2xl bg-white py-2.5 font-mono text-[11px] font-semibold tracking-[0.16em] uppercase shadow-[0_4px_0_rgba(0,0,0,0.18)] transition-transform active:translate-y-0.5 active:shadow-none disabled:opacity-60"
          style={{ color: locked ? "#64748b" : theme.popup }}
        >
          {cta}
        </button>
      </div>
    </div>
  )
}

function UnitPath({
  unit,
  unitIndex,
  selectedId,
  shakingId,
  arrived,
  hopping,
  onSelect,
  onLocked,
}: {
  unit: LearningUnit
  unitIndex: number
  selectedId: string | null
  shakingId: string | null
  arrived: boolean
  hopping: boolean
  onSelect: (id: string) => void
  onLocked: (id: string) => void
}) {
  const theme = themes[unit.theme]
  const points = useMemo(
    () => nodePositions(unit.nodes.length),
    [unit.nodes.length],
  )
  const trail = useMemo(() => curvePath(points), [points])
  const currentIndex = unit.nodes.findIndex((n) => n.status === "current")
  const lastDone = unit.nodes.reduce(
    (acc, n, i) =>
      n.status === "complete" || n.status === "claimed" ? i : acc,
    -1,
  )
  const progressCount = unit.nodes.filter(
    (n) =>
      n.status === "complete" ||
      n.status === "claimed" ||
      n.status === "current",
  ).length
  const progressPct =
    unit.nodes.length <= 1
      ? 0
      : Math.max(
          0,
          Math.min(100, ((progressCount - 0.5) / (unit.nodes.length - 1)) * 100),
        )
  const height = PAD_TOP + (unit.nodes.length - 1) * GAP + 96
  const fromIndex = currentIndex > 0 ? currentIndex - 1 : lastDone
  const buddyIndex =
    currentIndex < 0
      ? -1
      : arrived || fromIndex < 0
        ? currentIndex
        : fromIndex
  const buddyPoint = buddyIndex >= 0 ? points[buddyIndex] : null
  const buddySide = buddyPoint && buddyPoint.x >= CENTER ? -1 : 1

  return (
    <section className="relative mx-auto w-full">
      <div
        className={cn(
          "mx-auto mb-2 flex w-full max-w-[360px] items-center justify-between gap-3 rounded-2xl bg-gradient-to-r px-4 py-3 text-slate-950 shadow-[0_6px_0_rgba(0,0,0,0.22)]",
          theme.banner,
        )}
      >
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
            Unit {unit.number}
          </p>
          <h2 className="truncate text-lg font-semibold tracking-tight">
            {unit.title}
          </h2>
          <p className="truncate text-xs text-slate-950/70">{unit.description}</p>
        </div>
        <a
          href="#learn-reading"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/25 text-slate-950 hover:bg-white/40"
          aria-label="Open guidebook"
        >
          <BookOpen className="size-5" />
        </a>
      </div>

      <div className="relative mx-auto w-[360px] max-w-full overflow-visible" style={{ height }}>
        <svg
          className="pointer-events-none absolute inset-0"
          width={COL}
          height={height}
          viewBox={`0 0 ${COL} ${height}`}
        >
          <path
            d={trail}
            fill="none"
            stroke="#0b1220"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={trail}
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={trail}
            fill="none"
            stroke={theme.path}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={100}
            strokeDasharray={`${progressPct} 100`}
            className="transition-[stroke-dasharray] duration-1000"
            opacity={0.95}
          />
        </svg>

        {points.map((pos, i) =>
          i % 3 === 1 ? (
            <Bush
              key={`bush-${unit.id}-${i}`}
              className="pointer-events-none absolute opacity-70"
              style={{
                left: pos.x + (pos.x >= CENTER ? -118 : 70),
                top: pos.y + 28,
              }}
            />
          ) : null,
        )}
        {points.map((pos, i) =>
          i % 4 === 2 ? (
            <Coin
              key={`coin-${unit.id}-${i}`}
              className="pointer-events-none absolute opacity-90"
              style={{
                left: pos.x + (pos.x >= CENTER ? -96 : 56),
                top: pos.y - 36,
                animationDelay: `${i * 180}ms`,
              }}
            />
          ) : null,
        )}

        {unit.nodes.map((node, i) => {
          const pos = points[i]
          const current = node.status === "current"
          const selected = selectedId === node.id

          return (
            <div
              key={node.id}
              className="absolute"
              style={{
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              {current && !selected ? (
                <button
                  type="button"
                  data-path-node
                  onClick={() => onSelect(node.id)}
                  className="animate-start-bob absolute -top-14 left-1/2 z-20 -translate-x-1/2"
                >
                  <div
                    className="rounded-xl bg-white px-3.5 py-1.5 font-mono text-[11px] font-bold tracking-[0.18em] uppercase shadow-[0_4px_0_rgba(0,0,0,0.15)]"
                    style={{ color: theme.lip }}
                  >
                    Start
                  </div>
                  <div className="mx-auto -mt-1 size-2.5 rotate-45 bg-white" />
                </button>
              ) : null}

              <PathNodeButton
                node={node}
                theme={theme}
                current={current}
                shaking={shakingId === node.id}
                selected={selected}
                delay={unitIndex * 180 + i * 70}
                onClick={() =>
                  node.status === "locked"
                    ? onLocked(node.id)
                    : onSelect(node.id)
                }
              />

              {selected ? (
                <NodePopover
                  node={node}
                  theme={theme}
                  side={pos.x >= CENTER ? "right" : "left"}
                  onClose={() => onSelect(node.id)}
                />
              ) : null}
            </div>
          )
        })}

        {buddyPoint ? (
          <div
            className="path-buddy pointer-events-none absolute z-20 transition-[left,top] duration-[1100ms] ease-[cubic-bezier(0.34,1.3,0.64,1)]"
            style={{
              left: buddyPoint.x + buddySide * 78,
              top: buddyPoint.y - 8,
              transform: "translate(-50%, -50%)",
            }}
          >
            <MintBuddy hopping={hopping} />
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function LearningPath() {
  const current = learningUnits
    .flatMap((unit) => unit.nodes)
    .find((node) => node.status === "current")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [shakingId, setShakingId] = useState<string | null>(null)
  const [arrived, setArrived] = useState(false)
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const hopAt = window.setTimeout(() => setArrived(true), reduce ? 0 : 40)
    const settleAt = window.setTimeout(() => setIdle(true), reduce ? 0 : 1250)
    return () => {
      window.clearTimeout(hopAt)
      window.clearTimeout(settleAt)
    }
  }, [])

  useEffect(() => {
    if (!selectedId) return
    const onPointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("[data-path-popover], [data-path-node]")) return
      setSelectedId(null)
    }
    window.addEventListener("pointerdown", onPointer)
    return () => window.removeEventListener("pointerdown", onPointer)
  }, [selectedId])

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute top-[52%] right-0 size-48 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-10 left-4 size-52 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-8">
        {learningUnits.map((unit, unitIndex) => (
          <UnitPath
            key={unit.id}
            unit={unit}
            unitIndex={unitIndex}
            selectedId={selectedId}
            shakingId={shakingId}
            arrived={arrived}
            hopping={
              !idle &&
              arrived &&
              Boolean(unit.nodes.find((n) => n.status === "current"))
            }
            onSelect={(id) =>
              setSelectedId((prev) => (prev === id ? null : id))
            }
            onLocked={(id) => {
              setShakingId(id)
              window.setTimeout(() => setShakingId(null), 400)
            }}
          />
        ))}
      </div>
      <span className="sr-only">
        {current ? `Current lesson: ${current.title}` : "Learning path"}
      </span>
    </div>
  )
}
