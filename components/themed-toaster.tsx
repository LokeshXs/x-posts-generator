"use client"

import { useTheme } from "next-themes"
import { Toaster } from "sonner"

/**
 * Sonner toaster bound to the active next-themes value so toasts match
 * light/dark/system.
 */
export function ThemedToaster() {
  const { theme } = useTheme()

  return (
    <Toaster
      theme={(theme as "light" | "dark" | "system") ?? "system"}
      position="bottom-right"
      richColors
    />
  )
}
