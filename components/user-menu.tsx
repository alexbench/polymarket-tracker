'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { User, ChevronDown, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function getStatusBadge(status: string) {
  switch (status) {
    case 'TRIALING':
      return { label: 'Trial', className: 'bg-blue-500/10 text-blue-600' }
    case 'ACTIVE':
      return { label: 'Pro', className: 'bg-green-500/10 text-green-600' }
    case 'PAST_DUE':
      return { label: 'Past Due', className: 'bg-yellow-500/10 text-yellow-600' }
    case 'CANCELED':
    case 'EXPIRED':
      return { label: 'Expired', className: 'bg-red-500/10 text-red-600' }
    default:
      return { label: 'Free', className: 'bg-muted text-muted-foreground' }
  }
}

export function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (status === 'loading') {
    return <div className="w-24 h-8 rounded bg-muted animate-pulse" />
  }

  if (!session) {
    return (
      <Button variant="default" size="sm" onClick={() => signIn()}>
        Sign In
      </Button>
    )
  }

  const badge = getStatusBadge(session.user.subscriptionStatus || 'NONE')
  const displayName = session.user.name || session.user.email?.split('@')[0] || 'User'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary" />
          </div>
        )}
        <span className="text-sm font-medium max-w-[100px] truncate">
          {displayName}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${badge.className}`}>
          {badge.label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium truncate">{session.user.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Settings className="w-4 h-4" />
              Account
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors w-full text-left text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
