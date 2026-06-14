"use client"

import { Button } from "@/components/ui/button"

type Variant = "tile" | "glyph"

// ── SVG building blocks, mirrored 1:1 from <XenithMark> so the exported file is
// pixel-identical to what renders in the app. Kept here (not shared) because this
// is a throwaway export tool; if it becomes permanent, lift these into the mark.
const TOP_CHEVRON = "M18 15 L32 26 L46 15"
const BOTTOM_CHEVRON = "M18 49 L32 38 L46 49"

const WORDMARK = "enith"
const FONT_STACK = "Outfit, system-ui, sans-serif"

function markDefs(p: string, variant: Variant) {
  const common = `
    <linearGradient id="${p}-linear" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8b82ff" />
      <stop offset="50%" stop-color="#5b4ef8" />
      <stop offset="100%" stop-color="#231f75" />
    </linearGradient>`
  if (variant === "tile") {
    return `<defs>${common}
    <radialGradient id="${p}-gloss" cx="30%" cy="18%" r="75%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <filter id="${p}-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#0c0c0e" flood-opacity="0.35" />
    </filter>
  </defs>`
  }
  return `<defs>${common}
    <filter id="${p}-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" flood-color="#5b4ef8" flood-opacity="0.5" />
    </filter>
  </defs>`
}

// The 64×64 mark, drawn at the given x offset so the lockup can place text after.
function markBody(p: string, variant: Variant, x = 0) {
  if (variant === "tile") {
    return `<g transform="translate(${x} 0)">
    <rect x="0" y="0" width="64" height="64" rx="16" fill="url(#${p}-linear)" />
    <rect x="0" y="0" width="64" height="64" rx="16" fill="url(#${p}-gloss)" />
    <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="1.5" />
    <g fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#${p}-shadow)">
      <path d="${TOP_CHEVRON}" />
      <path d="${BOTTOM_CHEVRON}" />
    </g>
  </g>`
  }
  return `<g transform="translate(${x} 0)" fill="none" stroke="url(#${p}-linear)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" filter="url(#${p}-glow)">
    <path d="${TOP_CHEVRON}" />
    <path d="${BOTTOM_CHEVRON}" />
  </g>`
}

function buildMarkSvg(variant: Variant) {
  const p = `xn-${variant}`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256">
  ${markDefs(p, variant)}
  ${markBody(p, variant)}
</svg>`
}

// Measure "enith" with the brand font so the lockup viewBox hugs the text.
function measureWordmark(fontSize: number) {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return fontSize * WORDMARK.length * 0.55
  ctx.font = `600 ${fontSize}px ${FONT_STACK}`
  return ctx.measureText(WORDMARK).width
}

function buildLockupSvg(variant: Variant) {
  const p = `xn-${variant}-lockup`
  const fontSize = 34
  const letterSpacing = -1 // approximate `tracking-tight`
  const gap = 14 // space between the X mark and the wordmark
  const rightPad = 6
  const textStart = 64 + gap

  const textWidth =
    measureWordmark(fontSize) + (WORDMARK.length - 1) * letterSpacing
  const width = Math.ceil(textStart + textWidth + rightPad)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 64" width="${width * 4}" height="256">
  ${markDefs(p, variant)}
  ${markBody(p, variant)}
  <text x="${textStart}" y="32" dominant-baseline="central" text-anchor="start" font-family="${FONT_STACK}" font-weight="600" font-size="${fontSize}" letter-spacing="${letterSpacing}" fill="#0b0b0f">${WORDMARK}</text>
</svg>`
}

function download(filename: string, svg: string) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const ASSETS: { label: string; file: string; build: () => string }[] = [
  { label: "Tile — lockup (Xenith)", file: "xenith-tile-lockup.svg", build: () => buildLockupSvg("tile") },
  { label: "Tile — mark only (X)", file: "xenith-tile-mark.svg", build: () => buildMarkSvg("tile") },
  { label: "Glyph — lockup (Xenith)", file: "xenith-glyph-lockup.svg", build: () => buildLockupSvg("glyph") },
  { label: "Glyph — mark only (X)", file: "xenith-glyph-mark.svg", build: () => buildMarkSvg("glyph") },
]

export function LogoDownloads() {
  return (
    <div className="rounded-xl border border-border bg-background p-8">
      <p className="mb-1 text-sm font-medium text-foreground">Download SVG</p>
      <p className="mb-6 text-sm text-muted-foreground">
        Lockup includes the “enith” wordmark; “mark only” is just the X. Wordmark
        text references the Outfit font (not outlined).
      </p>
      <div className="flex flex-wrap gap-3">
        {ASSETS.map((asset) => (
          <Button
            key={asset.file}
            variant="outline"
            size="sm"
            onClick={() => download(asset.file, asset.build())}
          >
            {asset.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
