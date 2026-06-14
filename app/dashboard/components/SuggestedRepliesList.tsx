'use client'

import { useCallback, useEffect, useState } from 'react'
import { IconLoader2, IconRefresh } from '@tabler/icons-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getErrorMessage } from '@/app/onboarding/utils/getErrorMessage'
import type { XAccount } from '@/lib/services/posts'
import type { SuggestedReply } from '@/lib/services/suggested-replies'
import { generateSuggestedReplies } from '@/lib/services/suggested-replies-client'
import { SuggestedReplyCard } from './SuggestedReplyCard'

type Status = 'loading' | 'ready' | 'error'

export function SuggestedRepliesList() {
  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [replies, setReplies] = useState<SuggestedReply[]>([])
  const [xAccount, setXAccount] = useState<XAccount | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load replies. force=false serves a cached batch when fresh (cheap to call
  // on every view-open); force=true bypasses the cache to regenerate now.
  const load = useCallback(async (force: boolean) => {
    try {
      const data = await generateSuggestedReplies(force)
      // A refresh replaces the view with the latest run — earlier suggestions
      // are dropped by the API (they were never published, just suggestions).
      setReplies(data.replies)
      setXAccount(data.xAccount)
      setStatus('ready')
      setErrorMessage(null)
      return data
    } catch (error) {
      // 401 is handled globally by the apiClient interceptor.
      console.error('Failed to load suggested replies:', error)
      // Keep an already-loaded list visible on a failed refresh; only show the
      // error screen when the initial load fails.
      setStatus((prev) => (prev === 'ready' ? 'ready' : 'error'))
      setErrorMessage(
        getErrorMessage(
          error,
          'Something went wrong loading your suggested replies. Please try again.',
        ),
      )
      throw error
    }
  }, [])

  // Fetch on view-open. Cheap when the API serves a cached batch.
  useEffect(() => {
    let cancelled = false
    generateSuggestedReplies(false)
      .then((data) => {
        if (cancelled) return
        setReplies(data.replies)
        setXAccount(data.xAccount)
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) return
        // 401 is handled globally by the apiClient interceptor.
        console.error('Failed to load suggested replies:', error)
        setErrorMessage(
          getErrorMessage(
            error,
            'Something went wrong loading your suggested replies. Please try again.',
          ),
        )
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      const data = await load(true)
      if (data.replies.length === 0) {
        toast.success('No replies found — try again later')
      } else if (data.generated) {
        toast.success(
          `Generated ${data.replies.length} ${
            data.replies.length === 1 ? 'reply' : 'replies'
          }`,
        )
      } else {
        toast.success('Replies are up to date')
      }
    } catch {
      // Already surfaced by load(); on an existing list, keep it and toast.
      toast.error('Failed to refresh replies')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleUpdated = (updated: SuggestedReply) => {
    setReplies((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
  }

  const refreshButton = (
    <Button
      size="sm"
      variant="outline"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="self-start sm:self-auto"
    >
      {isRefreshing ? (
        <>
          <IconLoader2 className="size-4 animate-spin" />
          Refreshing…
        </>
      ) : (
        <>
          <IconRefresh className="size-4" />
          Refresh
        </>
      )}
    </Button>
  )

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <h1 className="text-2xl max-sm:text-xl font-semibold tracking-tight">
            Suggested Replies
          </h1>
        </header>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-destructive">
          {errorMessage ??
            'Something went wrong loading your suggested replies. Please try again.'}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            // load() surfaces failures via its own error state; swallow the
            // rejection here so it doesn't bubble as an unhandled rejection.
            load(false).catch(() => {})
          }}
        >
          <IconRefresh className="size-4" />
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-baseline gap-2">
          <h1 className="text-2xl max-sm:text-xl font-semibold tracking-tight">
            Suggested Replies
          </h1>
          {replies.length > 0 && (
            <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>
        {refreshButton}
      </header>

      {replies.length > 0 ? (
        <div className="flex flex-col gap-4">
          {replies.map((reply, index) => (
            <div
              key={reply.id}
              className="animate-in fade-in-0 fill-mode-both duration-300 ease-out motion-safe:slide-in-from-bottom-1"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <SuggestedReplyCard
                reply={reply}
                xAccount={xAccount}
                onUpdated={handleUpdated}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No suggested replies yet today — runs land throughout the day, or
            refresh to generate a batch now.
          </p>
        </div>
      )}
    </div>
  )
}
