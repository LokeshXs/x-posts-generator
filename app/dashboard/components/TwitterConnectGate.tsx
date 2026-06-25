'use client'

import { useEffect, useState } from 'react'
import { IconBrandX } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getTwitterAuthUrl, getTwitterStatus } from '@/lib/services/twitter'

type GateState =
  | { phase: 'loading' | 'ok' }
  | { phase: 'mustConnect'; needsReconnect: boolean }

/**
 * Checks the X connection status when the user lands on the dashboard. If the
 * backend reports `status: false`, it forces a non-dismissable dialog whose only
 * action runs the same connect flow as onboarding step 0.
 *
 * Mounted in the dashboard layout so it gates every dashboard route. The dialog
 * cannot be closed: Base UI's AlertDialog never dismisses on outside-click/Escape,
 * and we render no close/cancel control — the only way out is connecting (which
 * redirects to X).
 */
export function TwitterConnectGate() {
  const [state, setState] = useState<GateState>({ phase: 'loading' })
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getTwitterStatus()
      .then((res) => {
        if (cancelled) return
        if (res.status) {
          setState({ phase: 'ok' })
        } else {
          setState({
            phase: 'mustConnect',
            needsReconnect: Boolean(res.needsReconnect),
          })
        }
      })
      .catch(() => {
        // Don't block on a transient/unknown failure — the BackendStatusBanner
        // already surfaces outages. Only a definitive status:false gates the user.
        if (!cancelled) setState({ phase: 'ok' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (state.phase !== 'mustConnect') return null

  const { needsReconnect } = state

  async function handleConnect() {
    setIsConnecting(true)
    setError(null)
    try {
      const authUrl = await getTwitterAuthUrl('/dashboard')
      window.location.href = authUrl
    } catch {
      setError('Could not start X authorization. Please try again.')
      setIsConnecting(false)
    }
  }

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {needsReconnect ? 'Reconnect your X account' : 'Connect your X account'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {needsReconnect
              ? 'Your X connection has expired. Reconnect your account to keep generating and posting.'
              : 'Connect your X account to start generating posts and replies that sound like you.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <AlertDialogFooter>
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            size="lg"
            className="w-full sm:w-auto"
          >
            <IconBrandX />
            {isConnecting
              ? 'Redirecting to X…'
              : needsReconnect
                ? 'Reconnect X account'
                : 'Connect X account'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
