import axios from 'axios'

/**
 * Pings the backend's public health endpoint (`GET /api/v1/health`, no auth).
 *
 * Uses a bare axios call rather than the shared `apiClient` on purpose: the
 * endpoint needs no token, and `apiClient`'s 401 interceptor would sign the user
 * out — which we never want from a background health poll. Returns `true` only on
 * a 200 response; any error, non-200, or timeout resolves to `false`.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/health`,
      { timeout: 5000 }
    )
    return res.status === 200
  } catch {
    return false
  }
}
