"use client"

import { useEffect, useId, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

type Variant = "tile" | "glyph"

// Same smooth, no-overshoot spring the navbar uses to condense, so the wordmark
// collapse stays in lockstep with the bar's width/drop morph.
const WORDMARK_SPRING = { type: "spring", duration: 0.45, bounce: 0 } as const

type XenithMarkProps = {
  /** Visual treatment: gradient `tile` with a white X, or a gradient-filled `glyph`. */
  variant?: Variant
  /** When true, the X halves close into a solid X (the hover state). Respects reduced-motion. */
  animated?: boolean
  className?: string
}

/**
 * The Xenith "X" mark: a stylized X split by a gap in the middle (a `\/` chevron
 * on top, a `/\` chevron below), filled with a 3D-style brand violet gradient.
 *
 * `useId` namespaces the SVG gradient/mask ids so multiple instances on one page
 * never collide.
 */
export function XenithMark({
  variant = "tile",
  animated = false,
  className,
}: XenithMarkProps) {
  const uid = useId()
  const reduce = useReducedMotion()
  const linear = `xn-linear-${uid}`
  const gloss = `xn-gloss-${uid}`
  const glow = `xn-glow-${uid}`
  const shadow = `xn-shadow-${uid}`

  // Gapped-X geometry (viewBox 0 0 64 64): two chevrons whose vertices stop short
  // of center (y26 / y38) so a clear gap survives the round caps + glow.
  const topChevron = "M18 15 L32 26 L46 15"
  const bottomChevron = "M18 49 L32 38 L46 49"

  // On hover the two halves slide together (6u each) so their vertices meet at
  // the center and the gap closes into a solid X; releasing springs it back.
  const chevron = (dir: 1 | -1) => ({
    initial: false as const,
    animate: { y: animated ? dir * 6 : 0 },
    transition: reduce
      ? { duration: 0 }
      : { type: "spring" as const, stiffness: 420, damping: 30 },
  })

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-hidden
      className={cn("size-8 shrink-0", className)}
    >
      <defs>
        {/* 3D depth ramp: light top-left → brand → deep bottom-right. */}
        <linearGradient id={linear} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b82ff" />
          <stop offset="50%" stopColor="#5b4ef8" />
          <stop offset="100%" stopColor="#231f75" />
        </linearGradient>
        {/* Resting specular highlight in the top-left for the baseline "3D" sheen. */}
        <radialGradient id={gloss} cx="30%" cy="18%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id={shadow} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.2"
            floodColor="#0c0c0e"
            floodOpacity="0.35"
          />
        </filter>
        <filter id={glow} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="1.5"
            stdDeviation="1.6"
            floodColor="#5b4ef8"
            floodOpacity="0.5"
          />
        </filter>
      </defs>

      {variant === "tile" ? (
        <>
          {/* Gradient tile + resting highlight + glassy rim. */}
          <rect x="0" y="0" width="64" height="64" rx="16" fill={`url(#${linear})`} />
          <rect x="0" y="0" width="64" height="64" rx="16" fill={`url(#${gloss})`} />
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="15.25"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.14"
            strokeWidth="1.5"
          />
          {/* White gapped-X, lifted with a soft shadow. The halves close on hover. */}
          <g
            fill="none"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${shadow})`}
          >
            <motion.path d={topChevron} {...chevron(1)} />
            <motion.path d={bottomChevron} {...chevron(-1)} />
          </g>
        </>
      ) : (
        /* No tile: the X strokes themselves carry the gradient, with a violet glow. */
        <g
          fill="none"
          stroke={`url(#${linear})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${glow})`}
        >
          <motion.path d={topChevron} {...chevron(1)} />
          <motion.path d={bottomChevron} {...chevron(-1)} />
        </g>
      )}
    </svg>
  )
}

type XenithLogoProps = {
  variant?: Variant
  /** Hide the wordmark and render the mark only. */
  markOnly?: boolean
  /** Close the X's gap while the lockup is hovered/focused. */
  animateOnHover?: boolean
  /**
   * Collapse the "enith" wordmark out to the left, leaving just the X mark.
   * Driven by the navbar's scrolled/condensed state; animates back on release.
   */
  condensed?: boolean
  className?: string
  /** Link target; pass `null` to render a plain (non-link) lockup. */
  href?: string | null
}

/**
 * Xenith brand lockup: the gapped-X mark followed by the "enith" wordmark, so the
 * whole thing reads "Xenith". Mirrors the structure/classes of the existing Logo.
 * The mark is static and only animates while hovered/focused.
 */
export function XenithLogo({
  variant = "tile",
  markOnly = false,
  animateOnHover = true,
  condensed = false,
  className,
  href = "/",
}: XenithLogoProps) {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(false)
  // Only run the gap-close on real hover-capable (mouse) devices. On touch,
  // pointerenter/focus fire on tap with no matching leave, so the gap would
  // stick closed — so we disable the interaction there entirely.
  const [canHover, setCanHover] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const update = () => setCanHover(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const content = (
    <>
      <XenithMark
        variant={variant}
        animated={animateOnHover && canHover && active}
      />
      {!markOnly && (
        // Outer = clip window: collapses its width (and the gap before it) so the
        // X mark stays put as the leftmost thing. Inner = the text: slides out the
        // left edge and fades, so it reads as "exiting to the left", then returns.
        <motion.span
          aria-hidden={condensed}
          initial={false}
          animate={{
            width: condensed ? 0 : "auto",
            marginLeft: condensed ? 0 : "0.25rem",
          }}
          transition={reduce ? { duration: 0 } : WORDMARK_SPRING}
          className="inline-block overflow-hidden"
        >
          <motion.span
            translate="no"
            initial={false}
            animate={{ x: condensed ? -12 : 0, opacity: condensed ? 0 : 1 }}
            transition={reduce ? { duration: 0 } : WORDMARK_SPRING}
            className="inline-block whitespace-nowrap text-lg font-semibold tracking-tight text-foreground"
          >
            enith
          </motion.span>
        </motion.span>
      )}
    </>
  )

  const classes = cn(
    "group inline-flex items-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
    className
  )

  // Pointer + keyboard so the animation also plays on focus-visible — but only
  // when the device actually supports hover (skipped on touch / mobile).
  const interactionProps = canHover
    ? {
        onPointerEnter: () => setActive(true),
        onPointerLeave: () => setActive(false),
        onFocus: () => setActive(true),
        onBlur: () => setActive(false),
      }
    : {}

  if (href === null) {
    return (
      <span aria-label="Xenith" className={classes} {...interactionProps}>
        {content}
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-label="Xenith home"
      className={classes}
      {...interactionProps}
    >
      {content}
    </Link>
  )
}
