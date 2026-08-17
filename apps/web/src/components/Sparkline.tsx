export function Sparkline({
  data,
  className,
}: {
  data: number[]
  className?: string
}) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - min) / span) * 100
      return `${x},${y}`
    })
    .join(" ")
  const up = data[data.length - 1] >= data[0]

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={up ? "var(--gain)" : "var(--loss)"}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        points={points}
      />
    </svg>
  )
}
