"use client"

import { Fragment } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { IconSparkles } from "@tabler/icons-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

// Reveal timeline (seconds). Plays once on scroll into view: the text and
// cards both start right away (only a tiny stagger between elements), and the
// background image trails in 1s later.
const HEAD_BASE = 0
const HEAD_STAGGER = 0.05
const PARA_BASE = 0.08
const PARA_STAGGER = 0.014
const CARDS_BASE = 0.5
const CARDS_STAGGER = 0.07
const BTN_DELAY = 0.5
const BG_DELAY = 1

type Tweet = {
  handle: string
  views: string
  /** Each string is one line of the post body. */
  lines: string[]
}

const TWEETS: Tweet[] = [
  {
    handle: "@ShipItLokesh",
    views: "142k views",
    lines: ["shipped 4 features today", "still no PMF", "still posting"],
  },
  {
    handle: "@xenith",
    views: "210k views",
    lines: ["everyone's using AI to", "sound the same. use it to", "sound more like you."],
  },
  {
    handle: "@designerdada",
    views: "89k views",
    lines: ["nobody cares about your", "tech stack. they care what", "you shipped with it."],
  },
  {
    handle: "@buildinpublic",
    views: "54k views",
    lines: ["how I got my first", "1,000 followers on X"],
  },
  {
    handle: "@indiehacker",
    views: "38k views",
    lines: ["taste compounds.", "ship it ugly."],
  },
]

function TweetCard({ handle, views, lines, className }: Tweet & { className?: string }) {
  return (
    <div
      className={cn(
        "flex w-64 shrink-0 flex-col rounded-2xl border border-border bg-card p-4 text-left shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/10 text-primary">
            {handle.replace("@", "").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span translate="no" className="text-sm font-semibold text-foreground">
          {handle}
        </span>
        <span className="text-xs text-muted-foreground">&middot; {views}</span>
      </div>

      <div className="mt-3 space-y-0.5 text-sm leading-snug text-foreground">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <Badge variant="secondary" className="mt-4 gap-1">
        <IconSparkles data-icon="inline-start" aria-hidden />
        AI generated
      </Badge>
    </div>
  )
}

export function CTA() {
  const reduce = useReducedMotion()

  // Each child reads "hidden"/"show" from the section and a per-element `custom`
  // delay, so one timeline sequences words, then cards, then the background.
  const word: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : "0.45em", filter: reduce ? "none" : "blur(4px)" },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: reduce ? 0.01 : 0.5, ease: EASE_OUT, delay: reduce ? 0 : delay },
    }),
  }

  const rise: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 40 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.01 : 0.55, ease: EASE_OUT, delay: reduce ? 0 : delay },
    }),
  }

  const bg: Variants = {
    hidden: { opacity: 0 },
    show: (delay = 0) => ({
      opacity: 1,
      transition: { duration: reduce ? 0.2 : 0.9, ease: EASE_OUT, delay: reduce ? 0 : delay },
    }),
  }

  return (
    <motion.section
      id="cta"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="container mx-auto px-4 py-14 sm:px-12 sm:py-28 relative"
    >
      {/* Background — last to arrive, so the scene composes then settles in. */}
      <motion.div variants={bg} custom={BG_DELAY} className="absolute inset-0 z-0">
        <Image
          src="/background.png"
          alt=""
          fill
          className="object-cover mask-t-from-80% mask-x-to-100% mask-b-from-80% mask-r-from-40% mask-l-from-40% mask-r-to-100%"
        />
      </motion.div>

      <div className="flex flex-col items-center text-center z-2 relative">
        <h2 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          <Words
            text="Turn showing up into real growth."
            base={HEAD_BASE}
            stagger={HEAD_STAGGER}
            variants={word}
          />
        </h2>

        <p className="mt-6 max-w-xl text-balance text-base sm:text-lg leading-relaxed text-muted-foreground">
          <Words
            text="Xenith does the daily work that actually grows an account — in your voice, around what's trending in your niche. You just hit approve."
            base={PARA_BASE}
            stagger={PARA_STAGGER}
            variants={word}
          />
        </p>
      </div>

      {/* Tweet-card row — one card on mobile; from sm up the full row is
          edge-faded so the cards bleed off the sides. */}
      <div className="mt-12 sm:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex items-stretch justify-center gap-4 overflow-x-auto pb-2">
          {TWEETS.map((tweet, i) => (
            <motion.div
              key={tweet.handle}
              variants={rise}
              custom={CARDS_BASE + i * CARDS_STAGGER}
              className={cn("shrink-0", i !== 0 && "max-sm:hidden")}
            >
              <TweetCard {...tweet} className={i % 2 === 0 ? "-rotate-1" : "rotate-1"} />
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        variants={rise}
        custom={BTN_DELAY}
        className="mt-12 flex justify-center relative z-2"
      >
        <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
          Start growing
          <IconSparkles data-icon="inline-end" aria-hidden />
        </Button>
      </motion.div>
    </motion.section>
  )
}

/**
 * Splits `text` into words, each revealed as its own inline-block span so they
 * rise + de-blur in sequence. A plain space between spans (not inside them)
 * keeps natural wrapping and word spacing intact.
 */
function Words({
  text,
  base,
  stagger,
  variants,
}: {
  text: string
  base: number
  stagger: number
  variants: Variants
}) {
  const words = text.split(" ")
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <motion.span
            variants={variants}
            custom={base + i * stagger}
            className="inline-block"
          >
            {w}
          </motion.span>{" "}
        </Fragment>
      ))}
    </>
  )
}
