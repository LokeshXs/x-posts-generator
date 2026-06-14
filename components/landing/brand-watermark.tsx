"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

const TEXT = "Xenith"
const STAGGER = 0.09

/**
 * The giant footer brand watermark. On first scroll into view each letter
 * surfaces in a random order, fading up from opacity 0 + blur(10px).
 *
 * The random order is generated client-side, but the `hidden` state is
 * identical on server and client, so there's no hydration mismatch — the
 * per-letter delay only shapes the client transition, never the SSR markup.
 */
export function BrandWatermark() {
  const reduce = useReducedMotion()

  // rank[i] = the position of letter i in the reveal order, so each letter's
  // delay is rank[i] * STAGGER. Starts sequential (deterministic, SSR-safe)
  // and is shuffled on the client after mount — well before the footer scrolls
  // into view — so the reveal order is random per load without an impure render.
  const [rank, setRank] = useState<number[]>(() =>
    Array.from({ length: TEXT.length }, (_, i) => i),
  )

  useEffect(() => {
    // Shuffle on the next frame so the impure Math.random work and the state
    // update stay out of both render and the effect's synchronous body.
    const raf = requestAnimationFrame(() => {
      const order = Array.from({ length: TEXT.length }, (_, i) => i)
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[order[i], order[j]] = [order[j], order[i]]
      }
      const r = new Array<number>(TEXT.length)
      order.forEach((letterIndex, position) => {
        r[letterIndex] = position
      })
      setRank(r)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const container: Variants = { hidden: {}, show: {} }

  const letter: Variants = {
    hidden: { opacity: 0, filter: reduce ? "blur(0px)" : "blur(10px)" },
    show: (delay: number) => ({
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: reduce ? 0.3 : 0.7,
        ease: EASE_OUT,
        delay: reduce ? 0 : delay,
      },
    }),
  }

  return (
    <motion.span
      aria-hidden
      translate="no"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={container}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 translate-y-[26%] select-none whitespace-nowrap text-center text-[30vw] sm:text-[18vw] font-bold leading-none tracking-tight text-foreground/[0.07]"
    >
      {TEXT.split("").map((ch, i) => (
        <motion.span
          key={i}
          variants={letter}
          custom={rank[i] * STAGGER}
          className="inline-block"
        >
          {ch}
        </motion.span>
      ))}
    </motion.span>
  )
}
