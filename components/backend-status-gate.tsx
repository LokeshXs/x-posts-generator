'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react'

import { checkBackendHealth } from '@/lib/services/health'
import { Button } from '@/components/ui/button'

/**
 * Gates the backend-dependent parts of the app (dashboard / onboarding) behind a
 * health check. While the backend is reachable it renders its children
 * untouched; when the health endpoint reports the backend is down it replaces
 * them with a full-page downtime notice.
 *
 * Deliberately does NOT poll on an interval. It checks once on mount and then
 * only re-checks on events that imply something may have changed — the network
 * coming back, the tab regaining focus, or the user pressing "Try again". The
 * children render optimistically so a healthy backend incurs no perceptible
 * delay; only an actual failure swaps in the downtime screen.
 */
export function BackendStatusGate({
  children,
}: {
  children: React.ReactNode
}) {
  const [down, setDown] = useState(false)
  const [checking, setChecking] = useState(false)
  const mounted = useRef(true)

  const check = useCallback(async () => {
    setChecking(true)
    const ok = await checkBackendHealth()
    if (!mounted.current) return
    setDown(!ok)
    setChecking(false)
  }, [])

  useEffect(() => {
    mounted.current = true
    check()

    const onWake = () => {
      if (document.visibilityState === 'visible') check()
    }
    window.addEventListener('online', check)
    document.addEventListener('visibilitychange', onWake)

    return () => {
      mounted.current = false
      window.removeEventListener('online', check)
      document.removeEventListener('visibilitychange', onWake)
    }
  }, [check])

  if (!down) return <>{children}</>

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-4xl bg-muted text-muted-foreground">
        <IconAlertTriangle className="size-7" />
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
        We&rsquo;ll be right back
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Our servers aren&rsquo;t responding right now. The team is already working
        on it — please try again in a few minutes.
      </p>

      <div className="mt-8">
        <Button onClick={check} disabled={checking}>
          <IconRefresh className={checking ? 'animate-spin' : undefined} />
          {checking ? 'Checking…' : 'Try again'}
        </Button>
      </div>
    </main>
  )
}
