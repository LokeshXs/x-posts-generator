"use client"

import { useContext, useEffect, useState } from "react"
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"
import { IconSparkles } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { BentoHoverContext } from "../bento-grid"

const EASE_OUT = [0.23, 1, 0.32, 1] as const
const SCORE = 94

const chartConfig = {
  score: { label: "Engagement", color: "var(--chart-1)" },
} satisfies ChartConfig

/**
 * "High engagement scores" — a radial gauge. Static at rest (arc full at 94,
 * no draw on load). On card hover the chart remounts so the arc sweeps 0→94
 * and the centered score counts up. Reduced motion keeps the static 94.
 */
export function EngagementVisual() {
  const hovered = useContext(BentoHoverContext)
  const reduceMotion = useReducedMotion()

  // Bumping the chart key on hover-start remounts RadialBar so its mount
  // animation (0 → value) replays. Derived from the hover transition during
  // render (not an effect) — playCount === 0 is the initial static render.
  const [playCount, setPlayCount] = useState(0)
  const [wasHovered, setWasHovered] = useState(hovered)
  if (hovered !== wasHovered) {
    setWasHovered(hovered)
    if (hovered && !reduceMotion) setPlayCount((c) => c + 1)
  }

  const animateChart = playCount > 0 && !reduceMotion

  return (
    <div aria-hidden className="relative flex h-full min-h-44 items-center justify-center">
      <Badge variant="secondary" className="absolute right-0 top-0 gap-1">
        <IconSparkles />
        Predicted
      </Badge>

      <div className="relative aspect-square h-full max-h-52">
        <ChartContainer config={chartConfig} className="aspect-square h-full w-full">
          <RadialBarChart
            key={playCount}
            data={[{ name: "score", score: SCORE, fill: "var(--color-score)" }]}
            innerRadius="74%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              dataKey="score"
              angleAxisId={0}
              background
              cornerRadius={30}
              isAnimationActive={animateChart}
              animationDuration={1100}
              animationEasing="ease-out"
            />
          </RadialBarChart>
        </ChartContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Counter hovered={hovered} reduceMotion={!!reduceMotion} />
          <span className="mt-0.5 text-[11px] text-muted-foreground">
            Engagement score
          </span>
        </div>
      </div>
    </div>
  )
}

function Counter({
  hovered,
  reduceMotion,
}: {
  hovered: boolean
  reduceMotion: boolean
}) {
  const value = useMotionValue(SCORE)
  const label = useTransform(value, (v) => Math.round(v).toString())

  useEffect(() => {
    if (reduceMotion) {
      value.set(SCORE)
      return
    }
    if (hovered) {
      value.set(0)
      const controls = animate(value, SCORE, { duration: 1.1, ease: EASE_OUT })
      return () => controls.stop()
    }
    value.set(SCORE)
  }, [hovered, reduceMotion, value])

  return (
    <span className="flex items-baseline text-4xl font-semibold tabular-nums text-foreground">
      <motion.span>{label}</motion.span>
      <span className="text-base font-medium text-muted-foreground">/100</span>
    </span>
  )
}
