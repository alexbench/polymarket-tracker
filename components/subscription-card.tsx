'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { CreditCard, Loader2, AlertTriangle, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function SubscriptionCard() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<'checkout' | 'portal' | null>(null)

  async function handleCheckout() {
    setLoading('checkout')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL')
      }
    } catch (error) {
      toast.error('Failed to start checkout')
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading('portal')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No portal URL')
      }
    } catch (error) {
      toast.error('Failed to open billing portal')
      setLoading(null)
    }
  }

  if (!session) return null

  const status = session.user.subscriptionStatus
  const isTrialing = status === 'TRIALING'
  const isActive = status === 'ACTIVE'
  const isPastDue = status === 'PAST_DUE'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <CreditCard className="w-4 h-4 text-muted-foreground" />
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Status</span>
          <span
            className={`text-sm font-medium ${
              isActive
                ? 'text-green-500'
                : isTrialing
                  ? 'text-blue-500'
                  : isPastDue
                    ? 'text-red-500'
                    : 'text-muted-foreground'
            }`}
          >
            {isActive && <Check className="w-4 h-4 inline mr-1" />}
            {isPastDue && <AlertTriangle className="w-4 h-4 inline mr-1" />}
            {status.replace('_', ' ')}
          </span>
        </div>

        {isTrialing && session.user.trialEndDate && (
          <div className="text-sm text-muted-foreground">
            Trial ends:{' '}
            {new Date(session.user.trialEndDate).toLocaleDateString()}
          </div>
        )}

        <div className="pt-2 space-y-2">
          {(isTrialing || status === 'NONE' || status === 'EXPIRED') && (
            <Button
              onClick={handleCheckout}
              disabled={loading === 'checkout'}
              className="w-full"
            >
              {loading === 'checkout' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Subscribe - $50/month'
              )}
            </Button>
          )}

          {(isActive || isPastDue) && (
            <Button
              variant="outline"
              onClick={handlePortal}
              disabled={loading === 'portal'}
              className="w-full"
            >
              {loading === 'portal' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Manage Subscription'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
