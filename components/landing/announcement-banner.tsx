import { IconArrowUpRight } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

type AnnouncementBannerProps = {
  className?: string
}

/**
 * Rounded "what's new" pill that sits above the hero headline.
 * The trailing changelog segment is the interactive target.
 */
export function AnnouncementBanner({ className }: AnnouncementBannerProps) {
  return (
    <a
      href="#changelog"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-3 pr-1.5 text-sm shadow-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30",
        className
      )}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-primary"
      />
      <span className="font-medium text-foreground">
        New &mdash; Xenith 2.0 with multi-account orchestration
      </span>
      <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
        Read changelog
        <IconArrowUpRight className="size-3" aria-hidden />
      </span>
    </a>
  )
}
