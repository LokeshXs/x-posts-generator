import { apiClient } from '../api'
import type {
  SuggestedRepliesResponse,
  SuggestedReply,
} from './suggested-replies'

// GET /api/v1/suggested-replies/generate — on-demand, called on view-open.
// Serves a cached batch within the freshness window (~20 min) unless force is
// set, so it's cheap to call every time the view opens. When force=true it
// bypasses the cache and regenerates now (the manual refresh button).
export async function generateSuggestedReplies(
  force = false,
): Promise<SuggestedRepliesResponse> {
  const { data } = await apiClient.get<SuggestedRepliesResponse>(
    '/suggested-replies/generate',
    force ? { params: { force: true } } : undefined,
  )
  return data
}

interface UpdateSuggestedReplyResponse {
  reply: SuggestedReply
}

// PATCH /api/v1/suggested-replies/:id — saves an edited reply (≤280 chars),
// sets edited: true, and returns the full updated row.
export async function updateSuggestedReply(
  id: number,
  suggestedReply: string,
): Promise<SuggestedReply> {
  const { data } = await apiClient.patch<UpdateSuggestedReplyResponse>(
    `/suggested-replies/${id}`,
    { suggested_reply: suggestedReply },
  )
  return data.reply
}

// POST /api/v1/suggested-replies/:id/publish — posts the reply to X now.
// Idempotent (re-POSTing a posted reply returns it unchanged); a failed reply
// can be retried. Returns the full updated row (same shape as PATCH).
export async function publishSuggestedReply(id: number): Promise<SuggestedReply> {
  const { data } = await apiClient.post<UpdateSuggestedReplyResponse>(
    `/suggested-replies/${id}/publish`,
  )
  return data.reply
}
