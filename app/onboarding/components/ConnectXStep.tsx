'use client'

import { useState } from 'react'
import { IconCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useFormContext } from '../context/FormContext'
import { getTwitterAuthUrl } from '@/lib/services/twitter'
import { getErrorMessage } from '../utils/getErrorMessage'

export function ConnectXStep() {
  const { statusSteps } = useFormContext()

  const xConnected = statusSteps?.xAccount ?? false

  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect() {
    setIsConnecting(true)
    setError(null)
    try {
      const authUrl = await getTwitterAuthUrl('/onboarding')
      window.location.href = authUrl
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not start X authorization. Please try again.'))
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight text-pretty sm:text-3xl text-center sm:text-left ">
          Connect your <em>X</em> account
        </h2>
        <p className="text-muted-foreground">
          Import your recent posts to personalize your content and make generated posts feel like you.
        </p>
      </div>
      <ul className="text-sm text-muted-foreground space-y-2">
        <li>• Learn your writing style from your own posts</li>
        <li>• Generate content that sounds authentically like you</li>
        <li>• Improve suggestions over time</li>
      </ul>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      {xConnected ? (
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <IconCheck className="size-4 shrink-0" aria-hidden />
          <span>X account connected</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Button onClick={handleConnect} disabled={isConnecting} className="w-full" size="lg">
            {isConnecting ? 'Redirecting to X…' : 'Connect X Account'}
          </Button>
        
        </div>
      )}
    </div>
  )
}
