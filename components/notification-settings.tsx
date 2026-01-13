'use client'

import { useState, useEffect } from 'react'
import { Phone, Mail, Loader2, Check, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Wallet } from '@/types'

interface NotificationSettingsProps {
  wallets: Wallet[]
}

interface SubscriptionState {
  enabled: boolean
  value: string
  loading: boolean
  synced: boolean
}

export function NotificationSettings({ wallets }: NotificationSettingsProps) {
  const [sms, setSms] = useState<SubscriptionState>({
    enabled: false,
    value: '',
    loading: false,
    synced: false,
  })

  const [email, setEmail] = useState<SubscriptionState>({
    enabled: false,
    value: '',
    loading: false,
    synced: false,
  })

  // Load saved values from localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem('polymarket-tracker-phone')
    const savedEmail = localStorage.getItem('polymarket-tracker-email')

    if (savedPhone) {
      setSms((prev) => ({ ...prev, value: savedPhone, enabled: true }))
      checkSubscription(savedPhone, 'sms')
    }

    if (savedEmail) {
      setEmail((prev) => ({ ...prev, value: savedEmail, enabled: true }))
      checkSubscription(savedEmail, 'email')
    }
  }, [])

  async function checkSubscription(identifier: string, type: 'sms' | 'email') {
    try {
      const res = await fetch(`/api/subscriptions?identifier=${encodeURIComponent(identifier)}`)
      const data = await res.json()

      if (type === 'sms') {
        setSms((prev) => ({ ...prev, synced: data.exists }))
      } else {
        setEmail((prev) => ({ ...prev, synced: data.exists }))
      }
    } catch {
      // Ignore errors
    }
  }

  async function saveSubscription(type: 'sms' | 'email') {
    const state = type === 'sms' ? sms : email
    const setState = type === 'sms' ? setSms : setEmail
    const storageKey = type === 'sms' ? 'polymarket-tracker-phone' : 'polymarket-tracker-email'

    if (!state.value.trim()) {
      toast.error(`Please enter a ${type === 'sms' ? 'phone number' : 'email address'}`)
      return
    }

    if (wallets.length === 0) {
      toast.error('Add at least one wallet first')
      return
    }

    setState((prev) => ({ ...prev, loading: true }))

    try {
      // For SMS, also save phone number to user profile in database
      if (type === 'sms') {
        const userRes = await fetch('/api/user', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: state.value.trim() }),
        })

        if (!userRes.ok) {
          const data = await userRes.json()
          throw new Error(data.error || 'Failed to save phone number')
        }
      }

      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: state.value.trim(),
          type,
          wallets: wallets.map((w) => w.address),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save subscription')
      }

      localStorage.setItem(storageKey, state.value.trim())
      setState((prev) => ({ ...prev, synced: true, loading: false }))
      toast.success(`${type === 'sms' ? 'SMS' : 'Email'} notifications enabled`)
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false }))
      toast.error(error.message || 'Failed to save subscription')
    }
  }

  async function removeSubscription(type: 'sms' | 'email') {
    const state = type === 'sms' ? sms : email
    const setState = type === 'sms' ? setSms : setEmail
    const storageKey = type === 'sms' ? 'polymarket-tracker-phone' : 'polymarket-tracker-email'

    setState((prev) => ({ ...prev, loading: true }))

    try {
      // For SMS, also remove phone number from user profile in database
      if (type === 'sms') {
        await fetch('/api/user', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: null }),
        })
      }

      await fetch(`/api/subscriptions?identifier=${encodeURIComponent(state.value)}`, {
        method: 'DELETE',
      })

      localStorage.removeItem(storageKey)
      setState({ enabled: false, value: '', loading: false, synced: false })
      toast.success(`${type === 'sms' ? 'SMS' : 'Email'} notifications disabled`)
    } catch {
      setState((prev) => ({ ...prev, loading: false }))
      toast.error('Failed to remove subscription')
    }
  }

  const [testLoading, setTestLoading] = useState<'sms' | 'email' | null>(null)

  async function sendTest(type: 'sms' | 'email') {
    const to = type === 'sms' ? sms.value.trim() : email.value.trim()

    if (!to) {
      toast.error(`Please enter a ${type === 'sms' ? 'phone number' : 'email address'} first`)
      return
    }

    setTestLoading(type)

    try {
      const res = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, to }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send test')
      }

      toast.success(`Test ${type === 'sms' ? 'SMS' : 'email'} sent!`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test notification')
    } finally {
      setTestLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* SMS Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <CardTitle>SMS Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {!sms.enabled ? (
            <Button
              variant="outline"
              onClick={() => setSms((prev) => ({ ...prev, enabled: true }))}
              className="w-full"
            >
              Enable SMS Notifications
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="+1 555 555 5555"
                  value={sms.value}
                  onChange={(e) => setSms((prev) => ({ ...prev, value: e.target.value, synced: false }))}
                  className="flex-1"
                />
                {sms.synced && <Check className="w-5 h-5 text-accent self-center" />}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => saveSubscription('sms')}
                  disabled={sms.loading || !sms.value.trim()}
                  className="flex-1"
                >
                  {sms.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : sms.synced ? (
                    'Update'
                  ) : (
                    'Save'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendTest('sms')}
                  disabled={testLoading === 'sms' || !sms.value.trim()}
                  title="Send test SMS"
                >
                  {testLoading === 'sms' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => removeSubscription('sms')}
                  disabled={sms.loading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click <Send className="w-3 h-3 inline" /> to send a test notification.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {!email.enabled ? (
            <Button
              variant="outline"
              onClick={() => setEmail((prev) => ({ ...prev, enabled: true }))}
              className="w-full"
            >
              Enable Email Notifications
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email.value}
                  onChange={(e) => setEmail((prev) => ({ ...prev, value: e.target.value, synced: false }))}
                  className="flex-1"
                />
                {email.synced && <Check className="w-5 h-5 text-accent self-center" />}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => saveSubscription('email')}
                  disabled={email.loading || !email.value.trim()}
                  className="flex-1"
                >
                  {email.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : email.synced ? (
                    'Update'
                  ) : (
                    'Save'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendTest('email')}
                  disabled={testLoading === 'email' || !email.value.trim()}
                  title="Send test email"
                >
                  {testLoading === 'email' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => removeSubscription('email')}
                  disabled={email.loading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click <Send className="w-3 h-3 inline" /> to send a test notification.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Notifications are sent when tracked wallets make new trades.</p>
        <p>The system checks for new trades every 5 minutes.</p>
      </div>
    </div>
  )
}
