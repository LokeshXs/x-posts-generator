import Link from "next/link"
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
} from "@tabler/icons-react"

import { XenithLogo } from "@/components/brand/xenith-logo"
import { BrandWatermark } from "./brand-watermark"

type FooterLink = {
  label: string
  href: string
  external?: boolean
}

const LINKS: FooterLink[] = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Demo", href: "#demo" },
]

const SOCIALS = [
  { label: "X", href: "#", icon: IconBrandTwitter },
  { label: "LinkedIn", href: "#", icon: IconBrandLinkedin },
  { label: "GitHub", href: "#", icon: IconBrandGithub },
  { label: "Discord", href: "#", icon: IconBrandDiscord },
]

const linkClasses =
  "rounded text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30"

function FooterLink({ label, href, external }: FooterLink) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={linkClasses}>
        {label}
      </a>
    )
  }

  return (
    <Link href={href} className={linkClasses}>
      {label}
    </Link>
  )
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden ">
      <div className="container relative z-10 mx-auto px-4 pt-16 pb-[9vw] sm:px-12">
        {/* Centered logo */}
        <div className="flex justify-center">
          <XenithLogo />
        </div>

        {/* Centered link row */}
        <nav
          aria-label="Footer"
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          {LINKS.map((link) => (
            <FooterLink key={link.label} {...link} />
          ))}
        </nav>

  

        {/* Bottom bar: copyright left, socials right */}
        <div className="mt-6 sm:mt-12 flex flex-col max-sm:flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © Xenith 2026. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="rounded text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <Icon className="size-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Giant brand watermark, cropped at the bottom edge */}
      <BrandWatermark />
    </footer>
  )
}
