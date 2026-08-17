import { PageHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { articles, lessons } from "@/data/mock"

const completed = lessons.filter((lesson) => lesson.progress === 100).length
const overall = Math.round(
  lessons.reduce((sum, lesson) => sum + lesson.progress, 0) / lessons.length,
)

export function LearnPage() {
  const featured = lessons.find((lesson) => lesson.progress > 0 && lesson.progress < 100) ?? lessons[2]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Learn"
        description="Short modules on screening, paper trading, and classroom contests."
      />

      <Card>
        <CardHeader>
          <CardDescription>Continue</CardDescription>
          <CardTitle>{featured.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{featured.track}</Badge>
            <span>{featured.minutes} min</span>
          </div>
          <Progress value={featured.progress} />
          <Button>Resume lesson</Button>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lessons.map((lesson) => (
          <Card key={lesson.id}>
            <CardHeader>
              <CardDescription>{lesson.track}</CardDescription>
              <CardTitle>{lesson.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{lesson.minutes} minutes</p>
              <Progress value={lesson.progress} />
              <Button variant={lesson.progress === 0 ? "outline" : "secondary"} size="sm">
                {lesson.progress === 0
                  ? "Start"
                  : lesson.progress === 100
                    ? "Review"
                    : "Continue"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Path progress</CardTitle>
          <CardDescription>
            {completed} of {lessons.length} modules complete · {overall}% overall
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overall} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reading</CardTitle>
          <CardDescription>Filler notes for educators and students</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {articles.map((article) => (
            <div
              key={article.title}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="font-medium">{article.title}</p>
                <p className="text-sm text-muted-foreground">{article.source}</p>
              </div>
              <span className="text-xs text-muted-foreground">{article.read}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
