import { PreviewFrame } from "@/components/previews/PreviewFrame"
import { cn } from "@/lib/utils"

const previewNodes = [
  { id: "p1", x: 28, done: true },
  { id: "p2", x: 58, done: true },
  { id: "p3", x: 78, current: true },
  { id: "p4", x: 52, done: false },
  { id: "p5", x: 24, done: false },
]

export function LearningPreview() {
  return (
    <PreviewFrame to="/learn" label="Learning Preview" active="learn">
      <div className="relative h-full overflow-hidden">
        <p className="text-[11px] font-medium tracking-tight">Learn</p>
        <p className="mt-0.5 font-mono text-[8px] tracking-[0.16em] text-muted-foreground uppercase">
          Unit 1 · Halal foundations
        </p>
        <div className="relative mx-auto mt-1 h-[148px] w-[112px]">
          <svg className="absolute inset-0" viewBox="0 0 112 148" aria-hidden>
            <path
              d="M34 16 C34 28 64 32 64 44 C64 56 82 60 82 74 C82 88 56 92 56 108 C56 122 30 124 30 138"
              fill="none"
              stroke="#1e293b"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M34 16 C34 28 64 32 64 44 C64 56 82 60 82 74"
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
          {previewNodes.map((node, i) => (
            <span
              key={node.id}
              className={cn(
                "absolute size-5 rounded-full shadow-[0_2px_0_rgba(0,0,0,0.35)]",
                node.done && "bg-teal-400",
                node.current && "bg-teal-300 ring-2 ring-teal-200/50",
                !node.done && !node.current && "bg-slate-600",
              )}
              style={{ left: node.x, top: 8 + i * 26 }}
            />
          ))}
          <span
            className="animate-buddy-idle absolute"
            style={{ left: 92, top: 58 }}
            aria-hidden
          >
            <span className="relative block size-5">
              <span className="absolute top-0 left-1 size-1.5 rounded-full bg-emerald-400" />
              <span className="absolute top-0 left-2.5 size-1.5 rounded-full bg-emerald-500" />
              <span className="absolute top-1.5 left-0.5 size-4 rounded-full bg-teal-400" />
            </span>
          </span>
        </div>
      </div>
    </PreviewFrame>
  )
}
