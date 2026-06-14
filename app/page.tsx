import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { VideoDemo } from "@/components/landing/video-demo"
import { FeatureScroll } from "@/components/landing/feature-scroll"
import { BentoGrid } from "@/components/landing/bento-grid"
import { Pricing } from "@/components/landing/pricing"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero/>
        <VideoDemo />
        <FeatureScroll />
        <BentoGrid />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
