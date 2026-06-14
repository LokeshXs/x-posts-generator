"use client"

import { IconPlus, IconTrendingUp } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"

/**
 * "Track any creator's growth" — a watchlist of the creators a user has added
 * to track. Static and complete at rest; on card hover the rows lift in
 * sequence, each sparkline redraws in brand color, and the "add creator" pill
 * lights up. Pure CSS group-hover (the card shell is the `group`) — decorative
 * and safe under reduced motion.
 */

type Creator = {
  handle: string
  niche: string
  initials: string
  followers: string
  growth: string
  /** ~64×24 sparkline path. */
  spark: string
}

const CREATORS: Creator[] = [
  {
    handle: "@levelsup",
    niche: "Indie hacker",
    initials: "LU",
    followers: "128K",
    growth: "+12.8%",
    spark: "M1,20 C10,19 14,14 22,15 C30,16 34,9 42,8 C50,7 56,4 63,2",
  },
  {
    handle: "@designdaily",
    niche: "Design",
    initials: "DD",
    followers: "92K",
    growth: "+8.4%",
    spark: "M1,18 C9,18 13,12 21,13 C29,14 33,16 41,11 C49,7 56,6 63,4",
  },
  {
    handle: "@aibuilds",
    niche: "AI",
    initials: "AB",
    followers: "64K",
    growth: "+21.2%",
    spark: "M1,21 C9,20 14,18 22,16 C30,14 33,8 41,7 C49,6 55,3 63,1",
  },
  {
    handle: "@growthloop",
    niche: "Marketing",
    initials: "GL",
    followers: "47K",
    growth: "+5.1%",
    spark: "M1,16 C9,15 14,13 22,14 C30,15 34,10 42,10 C50,10 56,6 63,5",
  },
]

export function CreatorVisual() {
  return (
    <div aria-hidden className="flex h-full min-h-72 flex-col">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
        Tracking {CREATORS.length} creators
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-center gap-2">
        {CREATORS.map((creator, i) => (
          <CreatorRow key={creator.handle} creator={creator} index={i} />
        ))}
      </div>

      {/* Reinforces that more creators can be added to the watchlist. */}
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-300 group-hover:border-primary/40 group-hover:text-primary motion-reduce:transition-none">
        <span className="grid size-5 place-items-center rounded-full bg-muted text-muted-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none">
          <IconPlus className="size-3 transition-transform duration-300 group-hover:rotate-90 motion-reduce:transition-none" />
        </span>
        Add a creator to track
      </div>
    </div>
  )
}

function CreatorRow({ creator, index }: { creator: Creator; index: number }) {
  return (
    <div
      style={{ transitionDelay: `${index * 70}ms` }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-3 py-2 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:bg-accent/40 motion-reduce:translate-y-0 motion-reduce:transition-none"
    >
      <Avatar size="sm">
        <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
          {creator.initials}
        </AvatarFallback>
        <AvatarBadge className="bg-primary" />
      </Avatar>

      <div className="min-w-0 leading-tight">
        <p className="truncate text-xs font-semibold text-foreground" translate="no">
          {creator.handle}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {creator.niche}
        </p>
      </div>

      <Sparkline path={creator.spark} index={index} />

      <div className="ml-auto flex flex-col items-end leading-tight">
        <span className="text-xs font-semibold tabular-nums text-foreground">
          {creator.followers}
        </span>
        <span className="flex items-center gap-0.5 text-[11px] font-medium text-primary">
          <IconTrendingUp className="size-3" />
          {creator.growth}
        </span>
      </div>
    </div>
  )
}

/** Muted baseline (always full) + a primary overlay that draws in on hover. */
function Sparkline({ path, index }: { path: string; index: number }) {
  return (
    <svg
      viewBox="0 0 64 24"
      preserveAspectRatio="none"
      className="hidden h-6 w-16 shrink-0 sm:block"
    >
      <path d={path} fill="none" strokeWidth={2} className="stroke-muted-foreground/25" />
      <path
        d={path}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        style={{ transitionDelay: `${index * 70}ms` }}
        className={cn(
          "stroke-primary [stroke-dasharray:120] [stroke-dashoffset:120] transition-[stroke-dashoffset] duration-700 ease-out group-hover:[stroke-dashoffset:0]",
          "motion-reduce:[stroke-dashoffset:0] motion-reduce:transition-none",
        )}
      />
    </svg>
  )
}
