import { redirect } from 'next/navigation'

// /dashboard is just an entry point — send users to today's posts.
export default function Page() {
  redirect('/dashboard/todays-posts')
}
