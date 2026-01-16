'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Phone, ArrowRight } from 'lucide-react'

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkoutSuccess = searchParams.get('checkout') === 'success'
  const { update } = useSession()

  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save phone number')
        return
      }

      // Update session with new phone
      await update({ phone: phone.trim() })

      // Redirect to dashboard
      router.push('/')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleSkip() {
    router.push('/')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        {checkoutSuccess && (
          <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded mb-4">
            Payment method added successfully! Your 7-day trial has started.
          </div>
        )}
        <CardTitle className="text-2xl">Set Up Notifications</CardTitle>
        <p className="text-muted-foreground text-sm mt-2">
          Add your phone number to receive SMS alerts when tracked wallets make trades.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Include country code. US numbers: +1
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !phone.trim()}>
            {loading ? 'Saving...' : 'Save & Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleSkip}
          >
            Skip for now
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You can always add or change your phone number later in settings.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <OnboardingForm />
      </Suspense>
    </div>
  )
}
