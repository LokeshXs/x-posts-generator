"use client"

import { useEffect, useRef, useState } from "react"
import {
  IconCopy,
  IconEye,
  IconHeart,
  IconLoader2,
  IconMessageCircle,
  IconPencil,
  IconRepeat,
  IconRosetteDiscountCheckFilled,
  IconSparkles,
} from "@tabler/icons-react"
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from "motion/react"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

const SOURCE_TEXT =
  "consistency is overrated. the algorithm rewards taste — repeated."

const REPLY_TEXT =
  "couldn't agree more. taste compounds — the people who win just keep shipping things they'd actually want to read."

/** Status badges shown while the reply is being drafted. */
const STATUSES = [
  { label: "Analyzing", spin: true },
  { label: "Making it sound like you", spin: false },
  { label: "Generating", spin: true },
] as const

/** How long each draft status holds before the next one takes over. */
const STATUS_MS = 1050

type Phase =
  | "enterSource"
  | "enterReply"
  | "thinking"
  | "typing"
  | "done"
  | "resetting"

const TIMINGS: Record<Phase, number> = {
  enterSource: 900, // source post blurs in and settles
  enterReply: 750, // thread line draws, reply row pops in
  thinking: STATUSES.length * STATUS_MS + 350, // statuses cycle, then a beat
  typing: 3600, // settle + linear type + caret rest
  done: 2100, // "Suggested" check + copy/edit actions land
  resetting: 700, // everything fades, then the loop restarts
}

const NEXT: Record<Phase, Phase> = {
  enterSource: "enterReply",
  enterReply: "thinking",
  thinking: "typing",
  typing: "done",
  done: "resetting",
  resetting: "enterSource",
}

/**
 * The "Reply" panel scene: an infinite loop where a post arrives, a reply
 * card slides in beneath it, a status badge cycles analyze → match voice →
 * generate, and the suggested reply types itself out. Runs only while the
 * panel is in view; under reduced motion it renders the composed end state
 * with no timers.
 */
export function ReplyVisual() {
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { amount: 0.2 })
  const reduceMotion = useReducedMotion()

  const [phase, setPhase] = useState<Phase>("enterSource")
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (reduceMotion || !inView) return
    let timer: ReturnType<typeof setTimeout>

    // Restart from the top each time the panel enters view — bumping `cycle`
    // remounts the status cycler so it replays from "Analyzing".
    setPhase("enterSource")
    setCycle((c) => c + 1)

    const schedule = (p: Phase) => {
      timer = setTimeout(() => {
        const n = NEXT[p]
        setPhase(n)
        if (n === "enterSource") setCycle((c) => c + 1)
        schedule(n)
      }, TIMINGS[p])
    }

    schedule("enterSource")
    return () => clearTimeout(timer)
  }, [inView, reduceMotion])

  if (reduceMotion) return <StaticScene />

  const sourceVisible = phase !== "resetting"
  const replyVisible =
    phase === "enterReply" ||
    phase === "thinking" ||
    phase === "typing" ||
    phase === "done"
  const lineDrawn = phase !== "enterSource"

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="flex h-full w-full flex-col justify-center"
    >
      <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:p-4">
        {/* Source post */}
        <div className="flex gap-3">
          <div className="flex w-9 shrink-0 flex-col items-center">
            <Avatar size="lg" initial="M" />
            <ThreadLine drawn={lineDrawn} />
          </div>

          <motion.div
            className="min-w-0 flex-1"
            variants={CARD_VARIANTS}
            initial="hidden"
            animate={sourceVisible ? "show" : "hidden"}
          >
            <PostHeader name="Maya Chen" handle="mayabuilds" time="2h" />
            <p className="mt-1 text-[13px] leading-snug text-white/90">
              {SOURCE_TEXT}
            </p>
            <SourceMetrics />
          </motion.div>
        </div>

        {/* Suggested reply */}
        <motion.div
          className="mt-3 flex gap-3"
          variants={CARD_VARIANTS}
          initial="hidden"
          animate={replyVisible ? "show" : "hidden"}
        >
          <div className="flex w-9 shrink-0 justify-center pt-0.5">
            <Avatar size="sm" initial="P" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex max-sm:flex-col max-sm:items-start items-center gap-2">
              <p className="min-w-0 truncate text-[11px] text-white/55">
                Replying as{" "}
                <span className="font-medium text-white/90" translate="no">
                  @xenith
                </span>
              </p>
              <div className="ml-auto flex sm:min-w-[116px] shrink-0 justify-start sm:justify-end  w-full ">
                <ReplyStatus phase={phase} cycle={cycle} />
              </div>
            </div>

            <div className="mt-1.5 min-h-[3.25rem]">
              <ReplyBody phase={phase} />
            </div>

            <ReplyActions visible={phase === "done"} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Blur is cleared after the entrance so typed text isn't held on a rasterized
// GPU layer (same convention as generate-visual / hero-showcase).
const CARD_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: "blur(10px)",
    transition: { duration: 0.45, ease: EASE_OUT },
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE_OUT },
    transitionEnd: { filter: "none" },
  },
}

/** Draws downward from the source avatar once the reply is on its way. */
function ThreadLine({ drawn }: { drawn: boolean }) {
  return (
    <span className="relative mt-1.5 w-px flex-1 overflow-hidden rounded-full bg-white/15">
      <motion.span
        className="absolute inset-0 origin-top rounded-full bg-white/30"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: drawn ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      />
    </span>
  )
}

function Avatar({
  size,
  initial,
}: {
  size: "lg" | "sm"
  initial: string
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-white/20 font-semibold text-white ${
        size === "lg" ? "size-9 text-sm" : "size-7 text-xs"
      }`}
    >
      {initial}
    </span>
  )
}

function PostHeader({
  name,
  handle,
  time,
}: {
  name: string
  handle: string
  time: string
}) {
  return (
    <div className="flex items-center gap-1 text-[13px]">
      <span className="truncate font-semibold text-white">{name}</span>
      <IconRosetteDiscountCheckFilled className="size-3.5 shrink-0 text-white/80" />
      <span className="truncate text-[11px] text-white/55" translate="no">
        @{handle}
      </span>
      <span className="text-[11px] text-white/55">·</span>
      <span className="shrink-0 text-[11px] text-white/55">{time}</span>
    </div>
  )
}

function SourceMetrics() {
  // Spread across the row on narrow panels (no fixed gap to overflow); restore
  // the grouped-left look from sm up where there's room.
  return (
    <div className="mt-2 flex items-center justify-between sm:justify-start sm:gap-4">
      <Metric icon={IconMessageCircle} value="312" />
      <Metric icon={IconRepeat} value="1.2K" />
      <Metric icon={IconHeart} value="5.4K" />
      <Metric icon={IconEye} value="102K" />
    </div>
  )
}

function Metric({
  icon: Icon,
  value,
}: {
  icon: typeof IconHeart
  value: string
}) {
  return (
    <span className="flex items-center gap-1.5 text-white/55">
      <Icon className="size-4" />
      <span className="text-[11px] tabular-nums">{value}</span>
    </span>
  )
}

/** Crossfades the cycling draft statuses, then the final "Suggested" badge. */
function ReplyStatus({ phase, cycle }: { phase: Phase; cycle: number }) {
  if (phase === "thinking") return <StatusCycler key={cycle} />
  if (phase === "typing" || phase === "done") return <SuggestedBadge />
  return null
}

function StatusCycler() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (active >= STATUSES.length - 1) return
    const t = setTimeout(() => setActive((i) => i + 1), STATUS_MS)
    return () => clearTimeout(t)
  }, [active])

  const { label, spin } = STATUSES[active]

  return (
    <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium">
      {spin ? (
        <motion.span
          className="flex"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        >
          <IconLoader2 className="size-3 text-white/80" />
        </motion.span>
      ) : (
        <motion.span
          className="flex"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <IconSparkles className="size-3 text-white/80" />
        </motion.span>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          className="bg-clip-text whitespace-nowrap text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0.45) 35%, #ffffff 50%, rgba(255,255,255,0.45) 65%)",
            backgroundSize: "200% 100%",
          }}
          initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            backgroundPosition: ["150% 50%", "-50% 50%"],
          }}
          exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
          transition={{
            opacity: { duration: 0.3, ease: EASE_OUT },
            y: { duration: 0.3, ease: EASE_OUT },
            filter: { duration: 0.3, ease: EASE_OUT },
            backgroundPosition: { duration: 1, repeat: Infinity, ease: "linear" },
          }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function SuggestedBadge() {
  return (
    <motion.span
      className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white/90"
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
    >
      <IconRosetteDiscountCheckFilled className="size-3 text-white/80" />
      Suggested
    </motion.span>
  )
}

/**
 * Types by animating a motion value over the character count — no React
 * re-render per character, the string updates straight in the DOM.
 */
function ReplyBody({ phase }: { phase: Phase }) {
  const count = useMotionValue(0)
  const text = useTransform(count, (v) => REPLY_TEXT.slice(0, Math.round(v)))

  useEffect(() => {
    if (phase === "typing") {
      const controls = animate(count, REPLY_TEXT.length, {
        duration: 2.9,
        delay: 0.5, // let the reply row / badge swap settle before typing
        ease: "linear",
      })
      return () => controls.stop()
    }
    if (phase === "done") count.set(REPLY_TEXT.length)
    if (phase === "enterSource") count.set(0) // rewind for the next loop
    // "resetting": keep the full text while the card fades out
  }, [phase, count])

  return (
    <p className="text-[13px] leading-relaxed text-white/90">
      <motion.span>{text}</motion.span>
      {phase === "typing" && (
        <motion.span
          className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[2px] rounded-full bg-white/80"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      )}
    </p>
  )
}

/** Copy / edit affordances — always in layout (opacity only) so they don't shift. */
function ReplyActions({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="mt-3 flex items-center gap-4 border-t border-white/10 pt-2.5 text-white/55"
    >
      <span className="flex items-center gap-1.5">
        <IconCopy className="size-4" />
        <span className="text-[11px]">Copy</span>
      </span>
      <span className="flex items-center gap-1.5">
        <IconPencil className="size-4" />
        <span className="text-[11px]">Edit</span>
      </span>
    </motion.div>
  )
}

/**
 * Reduced motion: the composed end state — the post with its suggested reply,
 * no timers, no loop. The cycling status is transient in the animated flow,
 * so it's replaced by the final "Suggested" badge.
 */
function StaticScene() {
  return (
    <div aria-hidden className="flex h-full w-full flex-col justify-center">
      <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:p-4">
        <div className="flex gap-3">
          <div className="flex w-9 shrink-0 flex-col items-center">
            <Avatar size="lg" initial="M" />
            <span className="mt-1.5 w-px flex-1 rounded-full bg-white/30" />
          </div>
          <div className="min-w-0 flex-1">
            <PostHeader name="Maya Chen" handle="mayabuilds" time="2h" />
            <p className="mt-1 text-[13px] leading-snug text-white/90">
              {SOURCE_TEXT}
            </p>
            <SourceMetrics />
          </div>
        </div>

        <div className="mt-3 flex gap-3">
          <div className="flex w-9 shrink-0 justify-center pt-0.5">
            <Avatar size="sm" initial="P" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="min-w-0 truncate text-[11px] text-white/55">
                Replying as{" "}
                <span className="font-medium text-white/90" translate="no">
                  @xenith
                </span>
              </p>
              <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white/90">
                <IconRosetteDiscountCheckFilled className="size-3 text-white/80" />
                Suggested
              </span>
            </div>
            <p className="mt-1.5 min-h-[3.25rem] text-[13px] leading-relaxed text-white/90">
              {REPLY_TEXT}
            </p>
            <ReplyActions visible />
          </div>
        </div>
      </div>
    </div>
  )
}
