'use client'

import { useEffect } from 'react'

// global-error replaces the root layout when the layout itself throws, so it
// must render its own <html>/<body> and can't rely on ThemeProvider. It only
// activates in production builds.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            className="mt-8 inline-flex h-9 items-center justify-center rounded-4xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
