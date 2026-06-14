"use client"

import { IconTrendingUp } from "@tabler/icons-react"

const TRENDS = [

  { tag: "AI agents", pct: 78, delta: "+24%" },
  { tag: "ship fast", pct: 61, delta: "+11%" },

]

/**
 * "Always on-trend" — a live trending list. Static at rest (muted momentum
 * bars at their share); on card hover a brand-color fill sweeps across each
 * bar left→right, staggered. Pure CSS group-hover, reduced-motion safe.
 */
export function TrendsVisual() {
  return (
    <div aria-hidden className="flex h-full  flex-col">
     
  

      <div className=" flex flex-1 flex-col justify-center gap-3.5">
        {TRENDS.map((trend, i) => (
          <div key={trend.tag}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{trend.tag}</span>
              <span className="flex items-center gap-0.5 font-medium text-primary">
                <IconTrendingUp className="size-3" />
                {trend.delta}
              </span>
            </div>
            {/* Track is sized to the share; the fill sweeps across it on hover. */}
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                style={{ width: `${trend.pct}%` }}
                className="h-full overflow-hidden rounded-full bg-muted-foreground/20"
              >
                <div
                  style={{ transitionDelay: `${i * 90}ms` }}
                  className="h-full origin-left scale-x-0 rounded-full bg-primary transition-transform duration-700 ease-out group-hover:scale-x-100 motion-reduce:scale-x-100 motion-reduce:transition-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
