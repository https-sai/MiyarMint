import { cn } from "@/lib/utils"

export function MintBuddy({
  hopping = false,
  className,
  size = 88,
}: {
  hopping?: boolean
  className?: string
  size?: number
}) {
  return (
    <div
      className={cn("relative select-none", className)}
      style={{ width: size, height: size * 1.18 }}
      aria-hidden
    >
      <svg
        viewBox="0 0 88 104"
        className={cn(
          "relative z-10 drop-shadow-[0_10px_12px_rgba(0,0,0,0.35)]",
          hopping ? "animate-buddy-hop" : "animate-buddy-idle",
        )}
      >
        <ellipse cx="28" cy="80" rx="8" ry="12" fill="#0f766e" />
        <ellipse cx="58" cy="80" rx="8" ry="12" fill="#0f766e" />

        <g transform="translate(54 48)">
          <rect x="0" y="0" width="18" height="22" rx="5" fill="#b45309" />
          <rect x="2" y="3" width="14" height="8" rx="3" fill="#f59e0b" />
          <rect x="6" y="-4" width="6" height="8" rx="2" fill="#92400e" />
        </g>

        <ellipse cx="18" cy="60" rx="9" ry="12" fill="#14b8a6" transform="rotate(-18 18 60)" />
        <ellipse cx="68" cy="62" rx="8" ry="11" fill="#0d9488" transform="rotate(22 68 62)" />

        <ellipse cx="43" cy="58" rx="26" ry="28" fill="#2dd4bf" />
        <ellipse cx="43" cy="62" rx="16" ry="14" fill="#5eead4" opacity="0.78" />
        <ellipse cx="34" cy="48" rx="7" ry="5" fill="#ccfbf1" opacity="0.55" />

        <g style={{ transformOrigin: "36px 30px" }} className="animate-leaf-sway">
          <ellipse cx="34" cy="18" rx="9" ry="16" fill="#34d399" transform="rotate(-28 34 18)" />
          <path
            d="M34 30 Q31 18 34 6"
            fill="none"
            stroke="#065f46"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
        <g style={{ transformOrigin: "52px 28px" }} className="animate-leaf-sway-delayed">
          <ellipse cx="54" cy="16" rx="10" ry="18" fill="#10b981" transform="rotate(24 54 16)" />
          <path
            d="M52 30 Q55 16 54 4"
            fill="none"
            stroke="#064e3b"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>

        <path
          d="M20 58 Q12 50 16 44"
          fill="none"
          stroke="#14b8a6"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>

      <span className="animate-sparkle absolute top-1 right-2 size-2 rotate-45 bg-amber-200 shadow-[0_0_8px_#fde68a]" />
      <span className="animate-sparkle absolute top-6 left-1 size-1.5 rotate-45 bg-white/80 [animation-delay:0.6s]" />

      <span className="animate-buddy-shadow absolute bottom-0 left-1/2 h-2 w-10 rounded-full bg-black" />
    </div>
  )
}
