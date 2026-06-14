"use client"

import { createContext, useState, type ReactNode } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"
import { CreatorVisual } from "./bento/creator-visual"
import { EngagementVisual } from "./bento/engagement-visual"
import { TrendsVisual } from "./bento/trends-visual"
import { PersonalizeVisual } from "./bento/personalize-visual"

/**
 * True while the enclosing BentoCard is hovered. The JS-driven visuals (the
 * engagement arc + count-up, the typed reply) read this to replay their
 * animation on hover; the CSS-only visuals use `group-hover` directly. Cards
 * sit complete/static at rest.
 */
export const BentoHoverContext = createContext(false)

// Strong ease-out (emil) — punchier than the built-in CSS curve.
const EASE_OUT = [0.23, 1, 0.32, 1] as const

/**
 * Advantages bento. Near-monochrome with a single purple accent; each tile is
 * a dense, full-bleed product surface that animates in on scroll. Desktop
 * layout mirrors the reference: tall-left, two stacked middle, tall-right.
 *
 * On first scroll into view the tiles reveal in a staggered cascade (fade +
 * rise). Once only — they sit static afterward so the dense per-tile visuals
 * own the attention. Reduced motion keeps the fade, drops the movement.
 */
export function BentoGrid() {
  const reduce = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.04 },
    },
  }

  const card: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.55, ease: EASE_OUT },
    },
  }

  return (
    <section className="container mx-auto px-4 py-14 sm:px-12 sm:py-28">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:h-[42rem] lg:grid-cols-3 lg:grid-rows-3"
      >
        <BentoCard
          title="Track any creator's growth"
          description="Top tweets, format mix, and best posting hours — steal what's working before they tell you."
          className="lg:col-start-1 lg:row-span-3 lg:row-start-1"
          variants={card}
        >
          <CreatorVisual />
        </BentoCard>

        <BentoCard
          title="High engagement scores"
          description="Every draft is scored against what actually performs."
          className="lg:col-start-2 lg:row-start-1 lg:row-span-2"
          variants={card}
        >
          <EngagementVisual />
        </BentoCard>

        <BentoCard
          title="Always on-trend"
          description="Xenith tracks what is trending for you"
          className="lg:col-start-2 lg:row-start-3"
          variants={card}
        >
          <TrendsVisual />
        </BentoCard>

        <BentoCard
          title="Personalized to you with AI"
          description="We study the creators you add and how you write — then draft posts for you."
          className="lg:col-start-3 lg:row-span-3 lg:row-start-1"
          variants={card}
        >
          <PersonalizeVisual />
        </BentoCard>
      </motion.div>
    </section>
  )
}

function BentoCard({
  title,
  description,
  className,
  children,
  variants,
}: {
  title: string
  description: string
  className?: string
  children: ReactNode
  variants?: Variants
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      variants={variants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative flex min-h-[19rem] flex-col overflow-hidden rounded-4xl bg-card p-5 text-card-foreground shadow-md ring-1 ring-foreground/5 sm:p-6 lg:min-h-0",
        className,
      )}
    >
      <div className="relative z-10">
        <h3 className="text-balance text-lg font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <BentoHoverContext.Provider value={hovered}>
        <div className="relative mt-4 flex min-h-0 flex-1 flex-col">
          {children}
        </div>
      </BentoHoverContext.Provider>
    </motion.div>
  )
}
