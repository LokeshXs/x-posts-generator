'use client'

import { useEffect, useState } from 'react'
import {
  IconLogout,
  IconMoon,
  IconSelector,
  IconSun,
  type TablerIcon,
} from '@tabler/icons-react'
import { useTheme } from 'next-themes'
import { motion, useReducedMotion } from 'motion/react'

import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

function getInitials(email: string | undefined): string {
  if (!email) return '?'
  const name = email.split('@')[0]
  return name.slice(0, 2).toUpperCase()
}

const THEME_OPTIONS: {
  value: 'light' | 'dark'
  label: string
  icon: TablerIcon
  // Hover rotation mirrors the navbar toggle (sun swings out, moon tips in).
  hoverClass: string
}[] = [
  { value: 'light', label: 'Light', icon: IconSun, hoverClass: 'group-hover:rotate-45' },
  { value: 'dark', label: 'Dark', icon: IconMoon, hoverClass: 'group-hover:-rotate-12' },
]

function ThemePicker() {
  const { resolvedTheme, setTheme } = useTheme()
  const reduceMotion = useReducedMotion()
  // Avoid a hydration mismatch — the resolved theme isn't known on the server.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="px-2 py-1.5">
      <div className="mb-1.5 px-1 text-xs text-muted-foreground">Theme</div>
      <div className="relative flex items-center rounded-full bg-muted p-1">
        {THEME_OPTIONS.map(({ value, label, icon: Icon, hoverClass }) => {
          const active = mounted && resolvedTheme === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-label={label}
              aria-pressed={active}
              className={cn(
                'group relative z-10 flex flex-1 items-center justify-center rounded-full py-1.5 text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                // Reduced motion: paint the pill directly instead of sliding it.
                active && reduceMotion && 'bg-background shadow-sm',
              )}
            >
              {/* Shared-layout pill that springs between the two options, the
                  same technique as the landing pricing toggle. */}
              {active && !reduceMotion && (
                <motion.span
                  layoutId="theme-pill"
                  className="absolute inset-0 rounded-full bg-background shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  'relative z-10 size-4 transition-transform duration-300 ease-out motion-reduce:transition-none',
                  hoverClass,
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function NavUser() {
  const { user } = useAuth()
  const { isMobile } = useSidebar()

  const email = user?.email
  const initials = getInitials(email)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{email ?? 'Account'}</span>
                </div>
                <IconSelector className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="min-w-56 rounded-2xl"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex items-center gap-2 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 leading-tight">
                    <span className="truncate font-medium text-foreground">
                      {email ?? 'Account'}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <ThemePicker />
            <DropdownMenuSeparator />
            {/* GET /signout clears the Supabase session cookies and redirects to /login */}
            <DropdownMenuItem
              variant="destructive"
              nativeButton={false}
              render={<a href="/signout" />}
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
