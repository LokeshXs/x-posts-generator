import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export type InboxCardProps = {
  handle: string
  views: string
  /** Each string is one line of the post preview. */
  lines: string[]
  className?: string
}

/**
 * Lightweight "trending inbox" preview card. Decorative background element
 * for the hero showcase — intentionally low-contrast so it sits behind the
 * primary composer card.
 */
export function InboxCard({ handle, views, lines, className }: InboxCardProps) {
  return (
    <div
      className={cn(
        "w-64 rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm -rotate-2",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/10 text-primary">
            {handle.replace("@", "").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span translate="no" className="text-sm font-semibold text-foreground">
          {handle}
        </span>
        <span className="text-xs text-muted-foreground">&middot; {views}</span>
      </div>
      <div className="mt-3 space-y-0.5 text-sm leading-snug text-muted-foreground">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  )
}
