import {
  IconCalendar,
  IconPhoto,
  IconSend,
  IconWand,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const TAGS = [
  { label: "hook", highlight: false },
  { label: "contrarian", highlight: true },
  { label: "thread starter", highlight: false },
]

/**
 * The hero's centerpiece: a live post composer mock. Prominent (full card
 * elevation) so it reads as the focal point above the decorative side cards.
 */
export function ComposerCard({ className }: { className?: string }) {
  return (
    <Card className={cn("w-full max-w-md gap-4 rounded-3xl", className)}>
      <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-x-3">
        <Avatar>
          <AvatarImage src="/email/xenith-mark.png" alt="Xenith" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            X
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">Xenith</p>
          <p translate="no" className="truncate text-xs text-muted-foreground">
            @xenith &middot; drafting in your voice
          </p>
        </div>
        <Badge
          variant="outline"
          className="gap-1.5 border-border text-muted-foreground"
        >
          <span aria-hidden className="size-1.5 rounded-full bg-primary" />
          Live
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1 text-sm sm:text-base leading-relaxed text-foreground">
          <p>everyone&rsquo;s using AI to sound like everyone else.</p>
          <p>the ones winning use it to sound more like themselves.</p>
        </div>
        <p className="text-sm sm:text-base leading-relaxed text-foreground">
          here&rsquo;s the bigger lever no one talks about &darr;
        </p>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <Badge
              key={tag.label}
              variant="outline"
              className={cn(
                tag.highlight && "border-primary/30 text-primary"
              )}
            >
              {tag.label}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="justify-between border-t pt-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <IconPhoto className="size-4.5" aria-label="Add image" />
          <IconCalendar className="size-4.5" aria-label="Schedule date" />
          <IconWand className="size-4.5" aria-label="Rewrite with AI" />
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs text-muted-foreground"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            148 / 280
          </span>
          <Button size="sm">
            Schedule
            <IconSend data-icon="inline-end" aria-hidden />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
