"use client"

import { useContext, useEffect } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"
import {
  IconCheck,
  IconRosetteDiscountCheckFilled,
  IconSearch,
  IconSparkles,
} from "@tabler/icons-react"

import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { BentoHoverContext } from "../bento-grid"

// Creator tweets we "analyze" — different handles, distinct angles.
const SOURCES = [
  { handle: "@alex", text: "ship something small every single day. momentum compounds." },
  { handle: "@maya", text: "your first 100 posts are just you finding your voice. keep going." },
  { handle: "@devn", text: "nobody remembers the polished take. they remember the honest one." },
]

const POST =
  "the people who grow fastest aren't louder — they just sound unmistakably like themselves. find the one sentence only you would write, then keep writing it."

// The post starts typing only after the source rows have visibly scanned, so
// the card reads as analyze-then-write rather than a 1:1 rewrite.
const SCAN_STAGGER = 0.16 // seconds between each source row lighting up
const WRITE_DELAY = SOURCES.length * SCAN_STAGGER + 0.4

/**
 * "Personalized to you with AI" — a two-stage analyze → write pipeline.
 * On reveal the creator tweets scan/check in sequence ("Analyzing creators"),
 * then an original post types out in the user's voice ("Writing in your
 * voice"). Reduced motion shows the finished end-state with no animation.
 */
export function PersonalizeVisual() {
  const hovered = useContext(BentoHoverContext)
  const reduceMotion = useReducedMotion()

  return (
    <div aria-hidden className="flex h-full min-h-64 flex-col">
      {/* Stage 1 — analyze the creators you follow. */}
      <StageLabel n={1} icon={<IconSearch className="size-3" />}>
        Analyzing creators
      </StageLabel>

      <div className="mt-2 flex flex-col gap-1.5">
        {SOURCES.map((src, i) => (
          <div
            key={src.handle}
            style={{ transitionDelay: `${i * 160}ms` }}
            className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-2 transition-colors duration-500 group-hover:border-primary/30 group-hover:bg-accent motion-reduce:transition-none"
          >
            <span
              style={{ transitionDelay: `${i * 160 + 120}ms` }}
              className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:opacity-100"
            >
              <IconCheck className="size-2.5" stroke={3} />
            </span>
            <div className="min-w-0">
              <p
                className="text-[11px] font-medium text-muted-foreground"
                translate="no"
              >
                {src.handle}
              </p>
              <p className="mt-0.5 truncate text-[11px] leading-relaxed text-foreground/70">
                {src.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Synthesis connector. */}
      <div className="flex justify-center py-1.5 text-muted-foreground/50">
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
          <path
            d="M7 1v11m0 0L3 8m4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Stage 2 — write an original post in the user's voice. */}
      <StageLabel n={2} icon={<IconSparkles className="size-3" />}>
        Writing in your voice
      </StageLabel>

      <div className="mt-2 flex min-h-0 flex-1 flex-col rounded-2xl border border-primary/30 bg-accent/40 p-3">
        <div className="flex items-center gap-2">
          <Image
            src="/email/xenith-mark.png"
            alt="Xenith"
            width={24}
            height={24}
            className="size-6 shrink-0 rounded-full object-cover"
          />
          <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
            Xenith
            <IconRosetteDiscountCheckFilled className="size-3.5 text-primary" />
          </span>
          <Badge variant="secondary" className="ml-auto gap-1">
            <IconSparkles />
            In your voice
          </Badge>
        </div>
        <TypedPost hovered={hovered} reduceMotion={!!reduceMotion} />
      </div>
    </div>
  )
}

function StageLabel({
  n,
  icon,
  children,
}: {
  n: number
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
    
      <span className="flex items-center gap-1">
        {icon}
        {children}
      </span>
    </div>
  )
}

function TypedPost({
  hovered,
  reduceMotion,
}: {
  hovered: boolean
  reduceMotion: boolean
}) {
  // Full text at rest; on hover it clears and retypes after the scan.
  const count = useMotionValue(POST.length)
  const text = useTransform(count, (v) => POST.slice(0, Math.round(v)))

  useEffect(() => {
    if (reduceMotion) {
      count.set(POST.length)
      return
    }
    if (hovered) {
      count.set(0)
      const controls = animate(count, POST.length, {
        duration: 2.4,
        delay: WRITE_DELAY,
        ease: "linear",
      })
      return () => controls.stop()
    }
    count.set(POST.length)
  }, [hovered, reduceMotion, count])

  return (
    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
      <motion.span>{text}</motion.span>
    </p>
  )
}
