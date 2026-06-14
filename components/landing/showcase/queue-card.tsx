import { IconClock } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

export type QueueCardProps = {
  /** Scheduled slot, e.g. "tue 9:14 AM". */
  time: string
  /** Each string is one line of the queued post. */
  lines: string[]
  /** Predicted reach, e.g. "38k impressions". */
  predicted: string
  className?: string
}

/**
 * "Queue · ready" preview card showing a scheduled post and its predicted
 * reach. Decorative background element for the hero showcase.
 */
export function QueueCard({ time, lines, predicted, className }: QueueCardProps) {
  return (
    <div
      className={cn(
        "w-64 rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm rotate-2",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <IconClock className="size-3.5" aria-hidden />
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{time}</span>
      </div>
      <div className="mt-2 space-y-0.5 text-sm leading-snug text-foreground">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">predicted: {predicted}</p>
    </div>
  )
}
