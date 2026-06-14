"use client"

import { useEffect, useRef, useState } from "react"
import {
  IconChartBar,
  IconCheck,
  IconHeartFilled,
  IconMessageCircle,
  IconRepeat,
  IconRosetteDiscountCheckFilled,
  IconShare,
  IconSparkles,
} from "@tabler/icons-react"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from "motion/react"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

const POST_TEXT =
  "the algorithm doesn't reward consistency. it rewards taste — repeated."

const STEPS = [
  "Analyzing your X",
  "Analyzing trending posts",
  "Learning your tone & voice",
  "Drafting in your voice",
] as const

/** How long each timeline step stays active before completing. */
const STEP_MS = 1150

type Phase = "analyzing" | "writing" | "done" | "resetting"

const TIMINGS: Record<Phase, number> = {
  analyzing: STEPS.length * STEP_MS + 600, // all steps complete + settle beat
  writing: 4200, // card blurs in, text types out, caret settles
  done: 1900, // footer stats land, like count ticks up
  resetting: 700, // everything fades, then the loop restarts
}

const NEXT: Record<Phase, Phase> = {
  analyzing: "writing",
  writing: "done",
  done: "resetting",
  resetting: "analyzing",
}

/**
 * The "Generate" panel scene: an infinite analyze → write → publish loop.
 * The analysis timeline and the post card swap in place — steps run alone,
 * then fade out as the drafted post takes their spot. Runs only while the
 * panel is in view; under reduced motion it renders the composed end state
 * with no timers.
 */
export function GenerateVisual() {
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { amount: 0.2 })
  const reduceMotion = useReducedMotion()

  const [phase, setPhase] = useState<Phase>("analyzing")
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (reduceMotion || !inView) return
    let timer: ReturnType<typeof setTimeout>

    // Restart the scene from the top each time the panel enters view —
    // bumping `cycle` remounts the timeline so its step sequence replays.
    setPhase("analyzing")
    setCycle((c) => c + 1)

    const schedule = (p: Phase) => {
      timer = setTimeout(() => {
        const n = NEXT[p]
        setPhase(n)
        if (n === "analyzing") setCycle((c) => c + 1)
        schedule(n)
      }, TIMINGS[p])
    }

    schedule("analyzing")
    return () => clearTimeout(timer)
  }, [inView, reduceMotion])

  if (reduceMotion) return <StaticScene />

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="grid h-full w-full content-center"
    >
      {/* Timeline and post card share the same grid cell and crossfade. */}
      <motion.div
        className="col-start-1 max-sm:text-sm row-start-1 self-center justify-self-center"
        variants={TIMELINE_VARIANTS}
        initial={false}
        animate={phase === "analyzing" ? "show" : "hidden"}
      >
        <Timeline key={cycle} />
      </motion.div>

      <div className="col-start-1 row-start-1 self-center">
        <PostCard phase={phase} />
      </div>
    </div>
  )
}

const TIMELINE_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    filter: "blur(8px)",
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

/**
 * Vertical timeline stepper: steps activate one after another. The active
 * node pulses while its label shimmers; the connecting line draws downward
 * over the step's duration, landing on the next node as it lights up.
 */
function Timeline() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    let i = 0
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      timer = setTimeout(() => {
        i += 1
        setActive(i)
        if (i < STEPS.length) tick()
      }, STEP_MS)
    }

    tick()
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="px-2">
      {STEPS.map((label, i) => (
        <TimelineRow
          key={label}
          label={label}
          state={i < active ? "done" : i === active ? "active" : "upcoming"}
          isLast={i === STEPS.length - 1}
        />
      ))}
    </div>
  )
}

type StepState = "done" | "active" | "upcoming"

function TimelineRow({
  label,
  state,
  isLast,
}: {
  label: string
  state: StepState
  isLast: boolean
}) {
  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <TimelineNode state={state} />
        {!isLast && (
          <span className="relative my-1 w-0.5 flex-1 overflow-hidden rounded-full bg-white/15">
            {/* Draws downward while the step runs, stays full once done. */}
            <motion.span
              className="absolute inset-0 origin-top rounded-full bg-white/80"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: state === "upcoming" ? 0 : 1 }}
              transition={
                state === "active"
                  ? { duration: STEP_MS / 1000, ease: "linear" }
                  : { duration: 0.3, ease: EASE_OUT }
              }
            />
          </span>
        )}
      </div>

      <span className={isLast ? "pt-0.5" : "pt-0.5 pb-6"}>
        <StepLabel label={label} state={state} />
      </span>
    </div>
  )
}

function TimelineNode({ state }: { state: StepState }) {
  return (
    <span className="relative grid size-6 shrink-0 place-items-center">
      {state === "done" && (
        <motion.span
          className="absolute grid size-4 sm:size-6 place-items-center rounded-full bg-white"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
        >
          <IconCheck className="size-2 sm:size-3.5 text-primary" stroke={3.5} />
        </motion.span>
      )}

      {state === "active" && (
        <>
          {/* Pulsing glow ring */}
          <motion.span
            className="absolute size-6 rounded-full bg-white/40 blur-[2px]"
            animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut" }}
          />
          <span className="absolute size-6 rounded-full border border-white/30" />
          <span className="absolute size-2.5 rounded-full bg-white" />
        </>
      )}

      {state === "upcoming" && (
        <span className="size-2.5 rounded-full border-2 border-white/25" />
      )}
    </span>
  )
}

function StepLabel({ label, state }: { label: string; state: StepState }) {
  if (state === "active") {
    return (
      <motion.span
        className="bg-clip-text text-sm font-medium text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.45) 35%, #ffffff 50%, rgba(255,255,255,0.45) 65%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["150% 50%", "-50% 50%"] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        {label}
      </motion.span>
    )
  }

  return (
    <span
      className={`text-sm transition-colors duration-300 ${
        state === "done" ? "text-white/85" : "text-white/35"
      }`}
    >
      {label}
    </span>
  )
}

// Blur is cleared after the entrance so the typed text isn't held on a
// rasterized GPU layer (same convention as hero-showcase).
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

function PostCard({ phase }: { phase: Phase }) {
  const visible = phase === "writing" || phase === "done"

  return (
    <motion.div
      variants={CARD_VARIANTS}
      initial="hidden"
      animate={visible ? "show" : "hidden"}
      className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/20 text-sm font-semibold text-white">
          P
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex items-center gap-1 text-sm font-semibold text-white">
            Xenith
            <IconRosetteDiscountCheckFilled className="size-3.5 text-white/80" />
          </p>
          <p className="truncate text-xs text-white/60" translate="no">
            @xenith
          </p>
        </div>
        <motion.span
          className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80"
          animate={
            phase === "writing" ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }
          }
          transition={
            phase === "writing"
              ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
          }
        >
          <IconSparkles className="size-3" />
          {phase === "done" ? "Generated" : "Drafting"}
        </motion.span>
      </div>

      {/* min-height reserves both text lines so typing never reflows the card. */}
      <div className="mt-3 min-h-[3.5rem]">
        <TypedText phase={phase} />
      </div>

      <PostFooter visible={phase === "done"} />
    </motion.div>
  )
}

/**
 * Types by animating a motion value over the character count — no React
 * re-render per character, the string updates straight in the DOM.
 */
function TypedText({ phase }: { phase: Phase }) {
  const count = useMotionValue(0)
  const text = useTransform(count, (v) => POST_TEXT.slice(0, Math.round(v)))

  useEffect(() => {
    if (phase === "writing") {
      const controls = animate(count, POST_TEXT.length, {
        duration: 3.2,
        delay: 0.45, // let the card's blur-in settle before typing starts
        ease: "linear",
      })
      return () => controls.stop()
    }
    if (phase === "done") count.set(POST_TEXT.length)
    if (phase === "analyzing") count.set(0) // rewind for the next loop
    // "resetting": keep the full text while the card fades out
  }, [phase, count])

  return (
    <p className="text-sm sm:text-base leading-relaxed text-white/90">
      <motion.span>{text}</motion.span>
      {phase === "writing" && (
        <motion.span
          className="ml-0.5 inline-block h-[1.05em] w-0.5 translate-y-[3px] rounded-full bg-white/80"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      )}
    </p>
  )
}

/** Always in layout (opacity only) so its arrival never shifts the card. */
function PostFooter({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-white/55"
    >
      <FooterStat icon={IconMessageCircle} value="48" />
      <FooterStat icon={IconRepeat} value="126" />
      <LikeStat visible={visible} />
      <FooterStat icon={IconChartBar} value="12k" />
      <IconShare className="size-4" />
    </motion.div>
  )
}

function FooterStat({
  icon: Icon,
  value,
}: {
  icon: typeof IconMessageCircle
  value: string
}) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="size-4" />
      <span className="text-xs">{value}</span>
    </span>
  )
}

/** Heart pops and the count ticks up — the post "landing" beat. */
function LikeStat({ visible }: { visible: boolean }) {
  const n = useMotionValue(1180)
  const label = useTransform(n, (v) => Math.round(v).toLocaleString("en-US"))

  useEffect(() => {
    if (!visible) {
      n.set(1180)
      return
    }
    const controls = animate(n, 1294, {
      duration: 1.1,
      delay: 0.3,
      ease: EASE_OUT,
    })
    return () => controls.stop()
  }, [visible, n])

  return (
    <span className="flex items-center gap-1.5">
      <motion.span
        animate={visible ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4, ease: EASE_OUT }}
      >
        <IconHeartFilled className="size-4 text-rose-300" />
      </motion.span>
      <motion.span
        className="text-xs"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {label}
      </motion.span>
    </span>
  )
}

/**
 * Reduced motion: the composed end state — the finished post, no timers,
 * no loop. The timeline is transient in the animated flow, so it's omitted.
 */
function StaticScene() {
  return (
    <div
      aria-hidden
      className="flex h-full w-full flex-col justify-center"
    >
      <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/20 text-sm font-semibold text-white">
            P
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="flex items-center gap-1 text-sm font-semibold text-white">
              Xenith
              <IconRosetteDiscountCheckFilled className="size-3.5 text-white/80" />
            </p>
            <p className="truncate text-xs text-white/60" translate="no">
              @xenith
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
            <IconSparkles className="size-3" />
            Generated
          </span>
        </div>

        <p className="mt-3 min-h-[3.5rem] text-[15px] leading-relaxed text-white/90">
          {POST_TEXT}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-white/55">
          <FooterStat icon={IconMessageCircle} value="48" />
          <FooterStat icon={IconRepeat} value="126" />
          <span className="flex items-center gap-1.5">
            <IconHeartFilled className="size-4 text-rose-300" />
            <span
              className="text-xs"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              1,294
            </span>
          </span>
          <FooterStat icon={IconChartBar} value="12k" />
          <IconShare className="size-4" />
        </div>
      </div>
    </div>
  )
}
