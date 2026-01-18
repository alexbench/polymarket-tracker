'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Check } from 'lucide-react'

function CheckoutForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const canceled = searchParams.get('canceled')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect users who already have an active subscription
  useEffect(() => {
    if (session?.user?.hasActiveSubscription) {
      router.replace('/')
    }
  }, [session, router])

  async function handleCheckout() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        setError(`Server error: ${res.status} - ${text.slice(0, 100)}`)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
      }
    } catch (err) {
      setError(`Something went wrong: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Complete Your Setup</CardTitle>
        <p className="text-muted-foreground text-sm mt-2">
          Add a payment method to start your 7-day free trial
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {canceled && (
          <div className="bg-yellow-500/10 text-yellow-600 text-sm p-3 rounded">
            Checkout was canceled. Please try again to complete your setup.
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm">7-day free trial</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm">Unlimited wallet tracking</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm">SMS & email notifications</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm">Cancel anytime</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>7-day trial</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Then</span>
            <span>$50/month</span>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={loading}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {loading ? 'Loading...' : 'Add Payment Method'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You won&apos;t be charged until after your 7-day trial ends.
          Cancel anytime before then.
        </p>
      </CardContent>
    </Card>
  )
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <CheckoutForm />
      </Suspense>
    </div>
  )
}
