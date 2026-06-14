// Pulls a server-provided error message out of an unknown thrown value,
// falling back to a friendly default when the shape doesn't match.
export function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const maybe = err as { response?: { data?: { error?: string } } }
    return maybe.response?.data?.error ?? fallback
  }
  return fallback
}
