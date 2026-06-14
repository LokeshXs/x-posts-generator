"use client"

import { useEffect, useState } from "react"
import { IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  // resolvedTheme is client-only; gate the dynamic aria-label so server/client
  // markup matches until after hydration. The icon visuals are driven by the
  // `.dark` class, so they don't need gating.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      aria-label={
        mounted
          ? isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Toggle theme"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "group relative"
      )}
    >
      {/* Switch = scale + opacity cross-fade; hover = rotation (separate
          properties so the two animations never fight each other). */}
      <IconSun className="size-4 scale-100 rotate-0 opacity-100 transition-all duration-300 ease-out group-hover:rotate-45 motion-reduce:transition-none dark:scale-0 dark:opacity-0" />
      <IconMoon className="absolute size-4 scale-0 opacity-0 transition-all duration-300 ease-out group-hover:-rotate-12 motion-reduce:transition-none dark:scale-100 dark:opacity-100" />
    </button>
  )
}
