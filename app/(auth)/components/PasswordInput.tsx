'use client'

import { useRef, useState } from 'react'
import { EyeIcon, EyeOffIcon } from '@animateicons/react/lucide'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type AnimatedIconHandle = {
  startAnimation: () => void
  stopAnimation: () => void
}

type PasswordInputProps = Omit<React.ComponentProps<'input'>, 'type'>

// Password field with an animated show/hide eye toggle. Forwards all input props
// through to the shared Input; the toggle button sits inside the field on the
// right (pr-10 reserves room so the dots/text never run under the icon). The
// icon's ref is driven by the button's hover so the open/close eye animates.
export function PasswordInput({
  className,
  disabled,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const iconRef = useRef<AnimatedIconHandle>(null)

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className={cn('pr-10', className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        disabled={disabled}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-3xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
      >
        {visible ? (
          <EyeIcon ref={iconRef} size={16} />
        ) : (
          <EyeOffIcon ref={iconRef} size={16} />
        )}
      </button>
    </div>
  )
}
