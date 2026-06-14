import { XenithLogo } from '@/components/brand/xenith-logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col items-center">
        <XenithLogo className="mb-8" />
        {children}
      </div>
    </div>
  )
}
