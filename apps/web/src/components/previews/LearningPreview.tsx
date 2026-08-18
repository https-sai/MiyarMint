import { PreviewFrame } from "@/components/previews/PreviewFrame"
import { lessons } from "@/data/mock"

const featured =
  lessons.find((lesson) => lesson.progress > 0 && lesson.progress < 100) ?? lessons[2]
const previewLessons = lessons.slice(0, 3)

export function LearningPreview() {
  if (!featured) return null

  return (
    <PreviewFrame to="/learn" label="Learning Preview" active="learn">
      <div className="space-y-2.5">
        <p className="text-[11px] font-medium tracking-tight">Learn</p>
        <div className="bg-white/5 p-2 ring-1 ring-white/10">
          <p className="kicker text-[8px]">Continue</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-tight font-medium">
            {featured.title}
          </p>
          <div className="mt-2 h-1 overflow-hidden bg-white/10">
            <div
              className="h-full bg-primary"
              style={{ width: `${featured.progress}%` }}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          {previewLessons.map((lesson) => (
            <div key={lesson.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[10px] font-medium">{lesson.title}</p>
                <span className="shrink-0 font-mono text-[8px] text-muted-foreground">
                  {lesson.minutes}M
                </span>
              </div>
              <div className="h-1 overflow-hidden bg-white/10">
                <div
                  className="h-full bg-primary/80"
                  style={{ width: `${lesson.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PreviewFrame>
  )
}
