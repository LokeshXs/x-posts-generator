import type { XAccount } from './posts'

export interface SuggestedReplySourceMetrics {
  like_count?: number
  reply_count?: number
  retweet_count?: number
  quote_count?: number
  bookmark_count?: number
  impression_count?: number
}

export interface SuggestedReply {
  id: number // use for PATCH /suggested-replies/:id
  batch_id: string
  user_id: string

  // ── snapshot of the post being replied to ──
  source_tweet_id: string // link: `https://x.com/i/status/${source_tweet_id}`
  source_text: string
  source_author_id: string | null
  source_author_username: string | null // without "@"
  source_author_name: string | null
  source_author_avatar: string | null
  source_lang: string | null // BCP-47-ish code from X, e.g. "en", "hi"
  source_created_at: string | null // ISO 8601
  source_metrics: SuggestedReplySourceMetrics | null

  // ── AI output ──
  suggested_reply: string // ≤280 chars, same language as the post
  edited: boolean

  // ── publish lifecycle ──
  status: 'pending' | 'posted' | 'failed'
  tweet_id: string | null // the published reply's tweet id on X
  published_at: string | null // ISO 8601, set once posted
  publish_error: string | null // X's rejection reason when status is "failed"

  created_at: string
  updated_at: string
}

export interface SuggestedRepliesResponse {
  // IANA tz used for the day boundary (Preferences.timezone, defaults "UTC")
  timezone: string
  // Today's replies, flat. Newest run first; best match first within a run.
  replies: SuggestedReply[]
  // The connected X account to reply as; null if not connected.
  xAccount: XAccount | null
  // Whether the API actually regenerated (true) or served a cached batch (false).
  generated: boolean
}
