"use client"

import { useState } from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react"
import { IconCheck, IconChevronDown } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const EASE_OUT = [0.23, 1, 0.32, 1] as const

type Plan = {
  name: string
  monthly: number
  /** Per-month price when billed yearly (-20%). */
  yearly: number
  /** Optional struck-through "regular" price shown next to the current one. */
  strikethrough?: number
  blurb: string
  highlight?: boolean
  badge?: string
  /** Always-visible features. */
  features: string[]
  /** Extra features revealed by the "+N more features" toggle. */
  moreFeatures?: string[]
  cta: string
  ctaSub: string
}

const yearlyOf = (monthly: number) => Math.round(monthly * 0.8)

const PLANS: Plan[] = [
  {
    name: "Starter",
    monthly: 29,
    yearly: yearlyOf(29),
    blurb: "For creators getting serious about X.",
    features: [
      "AI Writer · 100 credits / day (10 drafts)",
      "Unlimited tweet scheduling",
      "Growth Tracking · 3 profiles",
      "Followers identification + Follow-back",
      "Visual creator without watermark · PNG export",
      "Overview + Weekly Recap analytics",
    ],
    cta: "Start 3-day free trial",
    ctaSub: "No charge for 3 days · cancel anytime",
  },
  {
    name: "Pro",
    monthly: 39,
    yearly: yearlyOf(39),
    strikethrough: 49,
    highlight: true,
    badge: "Early discount",
    blurb: "Limited launch price · regular $49/mo after.",
    features: [
      "Everything in Starter, plus:",
      "AI Writer · 1,000 credits / day (100 drafts)",
      "Viral Engine fully unlocked",
      "Growth Tracking · unlimited profiles",
      "Best posting moments per day",
    ],
    moreFeatures: [
      "Auto-DM new followers",
      "Thread composer with hooks library",
      "Competitor benchmarking dashboard",
      "Priority AI generation queue",
      "Export analytics to CSV",
    ],
    cta: "Start 3-day free trial",
    ctaSub: "No charge for 3 days · cancel anytime",
  },
]

type Billing = "monthly" | "yearly"

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly")
  const reduceMotion = useReducedMotion()

  // Staggered scroll reveal, matching the bento grid: the toggle and each plan
  // card fade + rise on first scroll into view. Once only; reduced motion keeps
  // the fade and drops the movement. `container` just coordinates the stagger;
  // the grid reuses it so its cards cascade after the toggle.
  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.04 },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.55, ease: EASE_OUT },
    },
  }

  return (
    <section id="pricing" className="container mx-auto px-4 py-14 sm:px-12 sm:py-28">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
      >
        <motion.div
          variants={item}
          className="flex flex-col items-center text-center"
        >
          <BillingToggle billing={billing} onChange={setBilling} />
        </motion.div>

        <motion.div
          variants={container}
          className="mx-auto mt-6 sm:mt-12 grid max-w-4xl gap-6 lg:grid-cols-2"
        >
          {PLANS.map((plan) => (
            <motion.div key={plan.name} variants={item}>
              <PlanCard plan={plan} billing={billing} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

function BillingToggle({
  billing,
  onChange,
}: {
  billing: Billing
  onChange: (b: Billing) => void
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-muted/60 p-1 text-sm">
      <ToggleButton active={billing === "monthly"} onClick={() => onChange("monthly")}>
        Monthly
      </ToggleButton>
      <ToggleButton active={billing === "yearly"} onClick={() => onChange("yearly")}>
        Yearly
        <span
          className={cn(
            "ml-2 rounded-full px-1.5 py-0.5 text-xs sm:text-sm font-semibold",
            billing === "yearly"
              ? "bg-primary/15 text-primary"
              : "bg-foreground/10 text-muted-foreground",
          )}
        >
          -20%
        </span>
      </ToggleButton>
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative inline-flex items-center rounded-full px-4 py-1.5 font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        // Reduced motion: paint the pill directly instead of animating it.
        active && reduceMotion && "bg-card shadow-sm",
      )}
    >
      {active && !reduceMotion && (
        <motion.span
          layoutId="billing-pill"
          className="absolute inset-0 rounded-full bg-card shadow-sm"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span className="relative z-10 inline-flex items-center">{children}</span>
    </button>
  )
}

function PlanCard({ plan, billing }: { plan: Plan; billing: Billing }) {
  const [expanded, setExpanded] = useState(false)
  const reduceMotion = useReducedMotion()
  const price = billing === "monthly" ? plan.monthly : plan.yearly

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-4xl bg-card p-6 text-card-foreground shadow-md ring-1 ring-foreground/5 sm:p-8",
        plan.highlight &&
          "ring-2 ring-primary shadow-[0_0_50px_-12px_var(--primary)]",
      )}
    >
      {plan.badge && (
        <span className="absolute -top-3 right-6 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
          {plan.badge}
        </span>
      )}

      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {plan.name}
      </span>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="relative inline-flex items-baseline overflow-hidden text-3xl sm:text-5xl font-semibold tracking-tight">
          $
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={price}
              initial={reduceMotion ? false : { y: "0.5em", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: "-0.5em", opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="inline-block tabular-nums"
            >
              {price}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="text-sm text-muted-foreground">/ month</span>
        {plan.strikethrough && (
          <span className="text-sm text-muted-foreground line-through">
            ${plan.strikethrough}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{plan.blurb}</p>

      <ul className="mt-6 space-y-3.5">
        {plan.features.map((feature) => (
          <FeatureItem key={feature}>{feature}</FeatureItem>
        ))}

        {plan.moreFeatures && (
          <AnimatePresence initial={false}>
            {expanded &&
              plan.moreFeatures.map((feature) => (
                <motion.li
                  key={feature}
                  initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                  className="flex items-start gap-2.5 overflow-hidden text-sm"
                >
                  <IconCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </motion.li>
              ))}
          </AnimatePresence>
        )}
      </ul>

      {plan.moreFeatures && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3.5 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary outline-none focus-visible:underline"
        >
          {expanded ? "Show less" : `+ ${plan.moreFeatures.length} more features`}
          <IconChevronDown
            className={cn(
              "size-4 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
      )}

      <div className="mt-auto pt-8">
        <Button
          size="lg"
          variant={plan.highlight ? "default" : "outline"}
          className="w-full"
        >
          {plan.cta}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {plan.ctaSub}
        </p>
      </div>
    </div>
  )
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <IconCheck className="mt-0.5 size-4 shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  )
}
