import { NextResponse, type NextRequest } from 'next/server'
import { getPostLoginRoute } from '@/lib/auth/post-login-route'
import { getSupabaseServerClient } from '@/lib/supabase/server-client'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getPostLoginRoute(searchParams.get('next'))

  if (code) {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`)
}
