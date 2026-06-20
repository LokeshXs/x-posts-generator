import type { Metadata } from "next"

import { SoonPage } from "./soon-page"

export const metadata: Metadata = {
  title: "Launching soon — Xenith",
  description:
    "Xenith, your X growth engine, launches on June 27, 2026.",
  openGraph: {
    title: "Launching soon — Xenith",
    description:
      "Xenith, your X growth engine, launches on June 27, 2026.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Launching soon — Xenith",
    description:
      "Xenith, your X growth engine, launches on June 27, 2026.",
  },
}

export default function Soon() {
  return <SoonPage />
}
