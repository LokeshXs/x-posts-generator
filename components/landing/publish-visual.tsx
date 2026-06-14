"use client"

import { useEffect, useRef, useState } from "react"
import {
  IconBrandX,
  IconChartBar,
  IconCircleFilled,
  IconClock,
  IconHeartFilled,
  IconMessageCircle,
  IconRepeat,
  IconRosetteDiscountCheckFilled,
} from "@tabler/icons-react"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

/** The Xenith post Xenith schedules, publishes, and that then goes live. */
const HERO = {
  text: "shipped at sunrise. metrics by lunch. thread tonight.",
  stats: { comments: 32, reposts: 97, likes: 1012, views: 9400 },
} as const

const SCHEDULE_LABEL = "9:00 AM"

/** Dim timeline neighbors that frame the hero so the feed reads as real. */
const NEIGHBORS = [
  {
    initials: "MR",
    name: "Maya Rao",
    handle: "@mayabuilds",
    time: "2h",
    text: "the best tools get out of your way and just ship the thing.",
  },
  {
    initials: "DD",
    name: "Dev Daily",
    handle: "@devdaily",
    time: "4h",
    text: "consistency on the timeline beats one viral post. every time.",
  },
] as const

/** "1012" → "1,012". Pure + deterministic so SSR matches the client. */
function formatStat(n: number) {
  return Math.round(n).toLocaleString("en-US")
}

type Phase = "scheduled" | "publishing" | "live" | "hold"

const TIMINGS: Record<Phase, number> = {
  scheduled: 2000, // hero sits queued with a "Scheduled · 9:00 AM" pill
  publishing: 700, // the slot hands off — scheduled fades, live drops in
  live: 2600, // live post settles; engagement ticks up; ring pulses
  hold: 1800, // calm hold on the landed post
}

const NEXT: Record<Phase, Phase> = {
  scheduled: "publishing",
  publishing: "live",
  live: "hold",
  hold: "scheduled",
}

/**
 * The "Publish" panel scene: a mock X home feed. The hero Xenith post starts
 * scheduled, then publishes itself into the timeline — a live badge lights, a
 * highlight ring pulses, and the engagement counts tick up — before the loop
 * rewinds to the scheduled state. Dim neighbor posts frame it so it reads as a
 * real feed. Runs only while in view; under reduced motion it renders the
 * composed end state, no timers.
 */
export function PublishVisual() {
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { amount: 0.1 })
  const reduceMotion = useReducedMotion()

  const [phase, setPhase] = useState<Phase>("scheduled")

  // Mirror the latest phase into a ref so the timer effect can read it when
  // (re)starting without depending on it — re-entering view resumes cleanly.
  const phaseRef = useRef(phase)
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    if (reduceMotion || !inView) return
    let timer: ReturnType<typeof setTimeout>

    // Self-rescheduling loop — every setState runs inside a timeout callback,
    // never synchronously in the effect body.
    const schedule = (p: Phase) => {
      timer = setTimeout(() => {
        const n = NEXT[p]
        setPhase(n)
        schedule(n)
      }, TIMINGS[p])
    }

    schedule(phaseRef.current)
    return () => clearTimeout(timer)
  }, [inView, reduceMotion])

  if (reduceMotion) return <StaticScene />

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="flex h-full w-full flex-col justify-center gap-2.5"
    >
      <FeedHeader />
      <NeighborPost neighbor={NEIGHBORS[0]} />
      <HeroPost phase={phase} />
      <NeighborPost neighbor={NEIGHBORS[1]} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Feed chrome.                                                        */
/* ------------------------------------------------------------------ */

function FeedHeader() {
  return (
    <div className="flex items-center gap-2 px-1 pb-1 text-white/70">
      <span className="grid size-6 place-items-center rounded-md bg-white/15">
        <IconBrandX className="size-3.5 text-white" />
      </span>
      <span className="text-xs font-semibold text-white">Home</span>
      <span className="ml-auto text-[10px] font-medium text-white/45">
        For you
      </span>
    </div>
  )
}

function NeighborPost({
  neighbor,
}: {
  neighbor: (typeof NEIGHBORS)[number]
}) {
  return (
    <div className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.06] p-2.5 opacity-55">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15 text-[10px] font-semibold text-white">
        {neighbor.initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-[11px] leading-tight text-white">
          <span className="font-semibold">{neighbor.name}</span>
          <span className="truncate text-white/45" translate="no">
            {neighbor.handle} · {neighbor.time}
          </span>
        </p>
        <p className="mt-0.5 line-clamp-1 text-[12px] text-white/70">
          {neighbor.text}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Hero post — crossfades between scheduled and live within a fixed     */
/* slot, so the surrounding feed never reflows.                         */
/* ------------------------------------------------------------------ */

function HeroPost({ phase }: { phase: Phase }) {
  const scheduledShown = phase === "scheduled"
  const live = phase === "publishing" || phase === "live" || phase === "hold"
  const counting = phase === "live" || phase === "hold"

  return (
    <div className="relative min-h-[7.5rem]">
      {/* Scheduled state — the queued draft with its slot. */}
      <motion.div
        initial={false}
        animate={{
          opacity: scheduledShown ? 1 : 0,
          y: scheduledShown ? 0 : -6,
          filter: scheduledShown ? "blur(0px)" : "blur(4px)",
        }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="absolute inset-0 rounded-xl border border-dashed border-white/25 bg-white/[0.06] p-3"
        style={{ pointerEvents: "none" }}
      >
        <div className="flex items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/20 text-[11px] font-semibold text-white">
            X
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="flex items-center gap-1 text-xs font-semibold text-white">
              Xenith
              <IconRosetteDiscountCheckFilled className="size-3 text-white/80" />
            </p>
            <p className="truncate text-[10px] text-white/55" translate="no">
              @xenith
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-primary">
            <IconClock className="size-3" stroke={2.5} />
            Scheduled · {SCHEDULE_LABEL}
          </span>
        </div>
        <p className="mt-2 text-[13px] leading-snug text-white/80">{HERO.text}</p>
        <p className="mt-2 border-t border-white/10 pt-2 text-[10px] font-medium text-white/45">
          Xenith will publish this for you at {SCHEDULE_LABEL}.
        </p>
      </motion.div>

      {/* Live state — the published post in the timeline. */}
      <motion.div
        initial={false}
        animate={{
          opacity: live ? 1 : 0,
          y: live ? 0 : 10,
          scale: live ? 1 : 0.97,
          filter: live ? "blur(0px)" : "blur(4px)",
          transitionEnd: { filter: live ? "none" : "blur(4px)" },
        }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="absolute inset-0 rounded-xl border border-white/25 bg-white/[0.12] p-3 backdrop-blur-sm"
        style={{ pointerEvents: "none" }}
      >
        <HighlightRing phase={phase} />

        <div className="flex items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/20 text-[11px] font-semibold text-white">
            X
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="flex items-center gap-1 text-xs font-semibold text-white">
              Xenith
              <IconRosetteDiscountCheckFilled className="size-3 text-white/80" />
            </p>
            <p className="truncate text-[10px] text-white/55" translate="no">
              @xenith
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white">
            <IconCircleFilled className="size-2 text-emerald-400" />
            Live · just now
          </span>
        </div>

        <p className="mt-2 text-[13px] leading-snug text-white/90">{HERO.text}</p>

        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-white/55">
          <CountStat icon={IconMessageCircle} target={HERO.stats.comments} run={counting} />
          <CountStat icon={IconRepeat} target={HERO.stats.reposts} run={counting} />
          <CountStat
            icon={IconHeartFilled}
            target={HERO.stats.likes}
            run={counting}
            iconClassName="text-rose-300"
          />
          <CountStat icon={IconChartBar} target={HERO.stats.views} run={counting} />
        </div>
      </motion.div>
    </div>
  )
}

/** One-shot ring that pulses outward as the post lands live. */
function HighlightRing({ phase }: { phase: Phase }) {
  if (phase !== "publishing") return null
  return (
    <motion.span
      className="pointer-events-none absolute inset-0 rounded-xl border-2 border-white/70"
      initial={{ scale: 1, opacity: 0.7 }}
      animate={{ scale: 1.06, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  )
}

/**
 * One engagement stat that counts from 0 → target when `run` flips true.
 * A single MotionValue drives a `motion.span` via `useTransform`, so the
 * digits roll with no re-renders.
 */
function CountStat({
  icon: Icon,
  target,
  run,
  iconClassName,
}: {
  icon: typeof IconMessageCircle
  target: number
  run: boolean
  iconClassName?: string
}) {
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => formatStat(v))

  useEffect(() => {
    if (!run) {
      mv.set(0)
      return
    }
    const controls = animate(mv, target, { duration: 1.6, ease: EASE_OUT })
    return () => controls.stop()
  }, [run, target, mv])

  return (
    <span className="flex items-center gap-1">
      <Icon className={iconClassName ? `size-3.5 ${iconClassName}` : "size-3.5"} />
      <motion.span className="text-[10px] tabular-nums">{text}</motion.span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Reduced motion — the composed feed: a scheduled neighbor + the live  */
/* hero, final stats. No timers, no loop.                               */
/* ------------------------------------------------------------------ */

function StaticScene() {
  return (
    <div
      aria-hidden
      className="flex h-full w-full flex-col justify-center gap-2.5"
    >
      <FeedHeader />
      <NeighborPost neighbor={NEIGHBORS[0]} />

      <div className="rounded-xl border border-white/25 bg-white/[0.12] p-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/20 text-[11px] font-semibold text-white">
            X
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="flex items-center gap-1 text-xs font-semibold text-white">
              Xenith
              <IconRosetteDiscountCheckFilled className="size-3 text-white/80" />
            </p>
            <p className="truncate text-[10px] text-white/55" translate="no">
              @xenith
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white">
            <IconCircleFilled className="size-2 text-emerald-400" />
            Live · just now
          </span>
        </div>
        <p className="mt-2 text-[13px] leading-snug text-white/90">{HERO.text}</p>
        <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-white/55">
          <span className="flex items-center gap-1">
            <IconMessageCircle className="size-3.5" />
            <span className="text-[10px]">{formatStat(HERO.stats.comments)}</span>
          </span>
          <span className="flex items-center gap-1">
            <IconRepeat className="size-3.5" />
            <span className="text-[10px]">{formatStat(HERO.stats.reposts)}</span>
          </span>
          <span className="flex items-center gap-1">
            <IconHeartFilled className="size-3.5 text-rose-300" />
            <span className="text-[10px]">{formatStat(HERO.stats.likes)}</span>
          </span>
          <span className="flex items-center gap-1">
            <IconChartBar className="size-3.5" />
            <span className="text-[10px]">{formatStat(HERO.stats.views)}</span>
          </span>
        </div>
      </div>

      <NeighborPost neighbor={NEIGHBORS[1]} />
    </div>
  )
}
