import { SidebarTrigger } from '@/components/ui/sidebar'
import { XenithLogo } from '@/components/brand/xenith-logo'

// Mobile-only top bar: the sidebar open/close trigger on the left, the Xenith
// logo pinned to the right end. Hidden from md up, where the sidebar is always
// visible and carries its own logo.
//
// Rendered once in the dashboard layout (above the page content) so every route
// gets the same full-bleed sticky bar. The top padding respects the notch via
// the safe-area inset so the bar isn't clipped on full-bleed mobile.
export function DashboardMobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background/80 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md md:hidden">
      <SidebarTrigger />
      <XenithLogo href="/dashboard" />
    </header>
  )
}
