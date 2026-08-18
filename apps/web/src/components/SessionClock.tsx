import { useEffect, useState } from "react"

export function SessionClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: "America/New_York",
  }).format(now)

  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase">
      <span className="size-1.5 bg-gain" />
      <span className="text-gain">Live</span>
      <span className="text-muted-foreground">{time} ET</span>
    </div>
  )
}
