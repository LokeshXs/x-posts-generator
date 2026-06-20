const DEFAULT_POST_LOGIN_ROUTE = '/onboarding'
const PRE_LAUNCH_ROUTE = '/soon'

function isSafeInternalRoute(route: string | null | undefined): route is string {
  return Boolean(route?.startsWith('/') && !route.startsWith('//'))
}

/**
 * Returns the destination to use after authentication.
 *
 * Only the explicit string "false" enables the pre-launch redirect. Missing,
 * "true", and any other value preserve the existing onboarding behavior.
 */
export function getPostLoginRoute(
  requestedRoute?: string | null,
): string {
  if (process.env.NEXT_PUBLIC_IS_LAUNCHED === 'false') {
    return PRE_LAUNCH_ROUTE
  }

  return isSafeInternalRoute(requestedRoute)
    ? requestedRoute
    : DEFAULT_POST_LOGIN_ROUTE
}
