'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { isAxiosError } from 'axios'
import { IconX } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import type { GeneratedPost, XAccount } from '@/lib/services/posts'
import { generateSuggestedReplies } from '@/lib/services/suggested-replies-client'
import { PostCard } from './PostCard'

const ERROR_REASON_MAP: Record<string, string> = {
  access_denied: 'You declined to authorize the X connection.',
  invalid_state: 'The authorization request was invalid. Please try again.',
  state_expired: 'The authorization session expired. Please try again.',
  token_exchange_failed: 'Failed to connect your X account. Please try again.',
}

async function generatePosts() {
  const { data } = await apiClient.get('/posts/generate')
  console.log(data)
}

type DashboardClientProps = {
  initialPosts: GeneratedPost[]
  timezone: string
  xAccount: XAccount | null
}

export function DashboardClient({
  initialPosts,
  timezone,
  xAccount,
}: DashboardClientProps) {
  const searchParams = useSearchParams()
  const twitterParam = searchParams.get('twitter')
  const reasonParam = searchParams.get('reason')

  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'engagement'>('newest')

  // The id of the highest-scoring post in today's batch — surfaced as a "Top
  // pick" marker. Advisory only; null when nothing was scored.
  const topPickId = useMemo(() => {
    let best: GeneratedPost | null = null
    for (const post of initialPosts) {
      if (post.engagement_score === null) continue
      if (!best || post.engagement_score > best.engagement_score!) best = post
    }
    return best?.id ?? null
  }, [initialPosts])

  // Default order is newest-first (server order). "Sort by engagement" pushes
  // scored posts up by score and unscored (null) posts to the bottom.
  const displayPosts = useMemo(() => {
    if (sortBy === 'newest') return initialPosts
    return [...initialPosts].sort((a, b) => {
      const sa = a.engagement_score
      const sb = b.engagement_score
      if (sa === null && sb === null) return 0
      if (sa === null) return 1
      if (sb === null) return -1
      return sb - sa
    })
  }, [initialPosts, sortBy])

  const anyScored = initialPosts.some((p) => p.engagement_score !== null)

  async function handleGenerateReplies() {
    setIsGeneratingReplies(true)
    try {
      const { replies } = await generateSuggestedReplies()
      if (replies.length === 0) {
        toast.success('No suggested replies generated')
      } else {
        toast.success(
          `${replies.length} suggested ${replies.length === 1 ? 'reply' : 'replies'} generated`,
        )
      }
    } catch (err) {
      // 401 is handled globally by the apiClient interceptor (signout + redirect).
      const status = isAxiosError(err) ? err.response?.status : undefined
      const apiMessage = isAxiosError(err)
        ? (err.response?.data?.error as string | undefined)
        : undefined
      if ((status === 400 || status === 402) && apiMessage) {
        toast.error(apiMessage)
      } else {
        toast.error('Failed to generate suggested replies. Please try again.')
      }
    } finally {
      setIsGeneratingReplies(false)
    }
  }

  useEffect(() => {
    if (twitterParam === 'connected') {
      const timer = setTimeout(() => setBannerDismissed(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [twitterParam])

  const showSuccessBanner = twitterParam === 'connected' && !bannerDismissed
  const showErrorBanner = twitterParam === 'error'
  const errorMessage =
    (reasonParam && ERROR_REASON_MAP[reasonParam]) ?? 'Failed to connect your X account.'

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto">
      {showSuccessBanner && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300">
          <p className="text-sm font-medium">X account connected successfully!</p>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss"
            className="-m-1.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-emerald-600/80 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:text-emerald-400/80 dark:hover:text-emerald-200"
          >
            <IconX className="size-4" aria-hidden />
          </button>
        </div>
      )}

      {showErrorBanner && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl max-sm:text-xl font-semibold tracking-tight text-pretty">
            Today&rsquo;s posts
          </h1>

          {initialPosts.length > 1 && anyScored && (
            <div className="inline-flex items-center rounded-lg border p-0.5 text-xs">
              <button
                type="button"
                aria-pressed={sortBy === 'newest'}
                onClick={() => setSortBy('newest')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  sortBy === 'newest'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Newest
              </button>
              <button
                type="button"
                aria-pressed={sortBy === 'engagement'}
                onClick={() => setSortBy('engagement')}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  sortBy === 'engagement'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Predicted engagement
              </button>
            </div>
          )}
        </div>

        {initialPosts.length > 0 ? (
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 [column-fill:_balance]">
            {displayPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                xAccount={xAccount}
                isTopPick={post.id === topPickId}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
            {/* TODO: show delivery time from preferences API — "your posts will be ready at <time>" */}
            <p className="text-muted-foreground text-sm">
              No posts yet today — your posts will be ready soon.
            </p>
            <p className="text-muted-foreground text-xs">Timezone: {timezone}</p>
          </div>
        )}
      </section>

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center">
        <Button className="w-full sm:w-auto" onClick={() => generatePosts()}>
          Generate
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={handleGenerateReplies}
          disabled={isGeneratingReplies}
        >
          {isGeneratingReplies ? 'Generating…' : 'Generate suggested replies'}
        </Button>
      </div>
    </div>
  )
}
