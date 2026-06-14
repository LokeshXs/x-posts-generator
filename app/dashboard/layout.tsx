import { cookies } from 'next/headers'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { BackendStatusGate } from '@/components/backend-status-gate'
import { DashboardSidebar } from './components/DashboardSidebar'
import { DashboardMobileHeader } from './components/DashboardMobileHeader'
import { TwitterConnectGate } from './components/TwitterConnectGate'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The sidebar persists its open/collapsed state in this cookie; read it on the
  // server so the initial render matches and there's no flash on reload.
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'

  return (
    <BackendStatusGate>
      <SidebarProvider defaultOpen={defaultOpen}>
        <DashboardSidebar />
        <SidebarInset>
          <TwitterConnectGate />
          <DashboardMobileHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </BackendStatusGate>
  )
}
