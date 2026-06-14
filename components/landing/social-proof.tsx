import { cn } from "@/lib/utils"

type SocialProofProps = {
  className?: string
}

const BRANDS = ["Linear", "Vercel", "Stripe", "Notion", "Loom"]

/**
 * "Loved by builders at" trust row. Text wordmarks (no logo assets) styled
 * with theme tokens so they stay subtle against the hero.
 */
export function SocialProof({ className }: SocialProofProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-8 gap-y-3",
        className
      )}
    >
      <span className="text-xs font-medium tracking-wide text-muted-foreground">
        Loved by builders at
      </span>
      <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
        {BRANDS.map((brand) => (
          <li
            key={brand}
            translate="no"
            className="text-sm font-semibold tracking-tight text-foreground/70"
          >
            {brand}
          </li>
        ))}
      </ul>
    </div>
  )
}
