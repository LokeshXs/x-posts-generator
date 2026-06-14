'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { IconAlertTriangle, IconHome, IconRefresh } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface the error to the console / any attached reporting service.
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-4xl bg-muted text-muted-foreground">
        <IconAlertTriangle className="size-7" />
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred while loading this page. You can try again
        or head back home.
      </p>

      {process.env.NODE_ENV === 'development' && error.message && (
        <pre className="mt-6 max-w-lg overflow-auto rounded-2xl bg-muted px-4 py-3 text-left text-xs text-muted-foreground">
          {error.message}
        </pre>
      )}

      <div className="mt-8 flex items-center gap-2">
        <Button variant="ghost" nativeButton={false} render={<Link href="/" />}>
          <IconHome />
          Back to home
        </Button>
        <Button onClick={() => reset()}>
          <IconRefresh />
          Try again
        </Button>
      </div>
    </main>
  )
}
