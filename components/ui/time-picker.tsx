'use client'

import * as React from 'react'
import { IconClock } from '@tabler/icons-react'

import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// 30-minute slots across the full day, stored as 24h "HH:mm" so the value stays
// compatible with the existing <input type="time"> data and API contract.
export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

/** "08:00" -> "8:00 AM". Returns the raw value if it can't be parsed. */
export function formatTime12(value: string): string {
  const [hStr, mStr] = (value || '').split(':')
  const hours = Number(hStr)
  const minutes = Number(mStr)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}

type TimePickerProps = {
  value: string
  onChange: (value: string) => void
  id?: string
  className?: string
  'aria-invalid'?: boolean
  'aria-label'?: string
}

export function TimePicker({
  value,
  onChange,
  id,
  className,
  'aria-invalid': ariaInvalid,
  'aria-label': ariaLabel,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selectedRef = React.useRef<HTMLButtonElement>(null)

  // Center the selected slot when the list opens so the user lands on their
  // current choice instead of the top of a 48-item list.
  React.useEffect(() => {
    if (!open) return
    const raf = requestAnimationFrame(() =>
      selectedRef.current?.scrollIntoView({ block: 'center' }),
    )
    return () => cancelAnimationFrame(raf)
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-1.5 rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow,background-color] outline-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
          'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
          'data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/30',
          className,
        )}
      >
        <span className="flex items-center gap-2">
          <IconClock className="size-4 shrink-0 text-muted-foreground" />
          {value ? formatTime12(value) : 'Select a time'}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--anchor-width) gap-2 p-2"
      >
        <p className="px-2 pt-1 text-xs font-medium text-muted-foreground">
          Available times
        </p>
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-0.5">
          {TIME_SLOTS.map((slot) => {
            const selected = slot === value
            return (
              <button
                key={slot}
                type="button"
                ref={selected ? selectedRef : undefined}
                aria-pressed={selected}
                onClick={() => {
                  onChange(slot)
                  setOpen(false)
                }}
                className={cn(
                  'flex items-center justify-center rounded-full border px-3 py-2 text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background text-foreground hover:bg-muted',
                )}
              >
                {formatTime12(slot)}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
