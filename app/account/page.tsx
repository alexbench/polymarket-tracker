'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, LogOut, User, Phone, Mail, CreditCard, Bell, Save, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

const COUNTRY_CODES = [
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'JP', name: 'Japan', dial: '+81' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'BR', name: 'Brazil', dial: '+55' },
  { code: 'MX', name: 'Mexico', dial: '+52' },
  { code: 'OTHER', name: 'Other', dial: '' },
]

function formatDate(date: Date | string | undefined) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'TRIALING':
      return { label: 'Trial', className: 'bg-blue-500/10 text-blue-600' }
    case 'ACTIVE':
      return { label: 'Active', className: 'bg-green-500/10 text-green-600' }
    case 'PAST_DUE':
      return { label: 'Past Due', className: 'bg-yellow-500/10 text-yellow-600' }
    case 'CANCELED':
    case 'EXPIRED':
      return { label: 'Canceled', className: 'bg-red-500/10 text-red-600' }
    default:
      return { label: 'None', className: 'bg-muted text-muted-foreground' }
  }
}

export default function AccountPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('US')
  const [customDialCode, setCustomDialCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [billingLoading, setBillingLoading] = useState(false)
  const [testingSMS, setTestingSMS] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testSuccess, setTestSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      const existingPhone = session.user.phone || ''
      if (existingPhone) {
        // Try to match country code from existing phone
        const matchedCountry = COUNTRY_CODES.find(
          (c) => c.dial && existingPhone.startsWith(c.dial)
        )
        if (matchedCountry && matchedCountry.code !== 'OTHER') {
          setCountryCode(matchedCountry.code)
          setPhone(existingPhone.slice(matchedCountry.dial.length))
        } else if (existingPhone.startsWith('+')) {
          // Phone has a country code we don't recognize - extract it
          const dialMatch = existingPhone.match(/^(\+\d{1,4})/)
          if (dialMatch) {
            setCountryCode('OTHER')
            setCustomDialCode(dialMatch[1])
            setPhone(existingPhone.slice(dialMatch[1].length))
          } else {
            setPhone(existingPhone)
          }
        } else {
          setPhone(existingPhone)
        }
      }
    }
  }, [session])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const dialCode = countryCode === 'OTHER'
        ? customDialCode
        : COUNTRY_CODES.find((c) => c.code === countryCode)?.dial || '+1'
      const fullPhone = phone ? `${dialCode}${phone.replace(/\D/g, '')}` : ''

      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: fullPhone }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }

      await update({ name, phone: fullPhone })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleManageBilling() {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Failed to open billing portal')
    } finally {
      setBillingLoading(false)
    }
  }

  async function testSMS() {
    if (!phone) {
      setError('Please enter a phone number first')
      return
    }
    setTestingSMS(true)
    setError('')
    setTestSuccess(null)
    try {
      const dialCode = countryCode === 'OTHER'
        ? customDialCode
        : COUNTRY_CODES.find((c) => c.code === countryCode)?.dial || '+1'
      const fullPhone = `${dialCode}${phone.replace(/\D/g, '')}`

      const res = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sms', to: fullPhone }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send test SMS')
      }
      setTestSuccess('Test SMS sent! Check your phone.')
      setTimeout(() => setTestSuccess(null), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to send test SMS')
    } finally {
      setTestingSMS(false)
    }
  }

  async function testEmail() {
    const email = session?.user?.email
    if (!email) {
      setError('No email address found')
      return
    }
    setTestingEmail(true)
    setError('')
    setTestSuccess(null)
    try {
      const res = await fetch('/api/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email', to: email }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send test email')
      }
      setTestSuccess('Test email sent! Check your inbox.')
      setTimeout(() => setTestSuccess(null), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to send test email')
    } finally {
      setTestingEmail(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const badge = getStatusBadge(session.user.subscriptionStatus || 'NONE')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-base font-medium">Account Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded">
            Changes saved successfully!
          </div>
        )}

        {testSuccess && (
          <div className="bg-blue-500/10 text-blue-600 text-sm p-3 rounded">
            {testSuccess}
          </div>
        )}

        {/* Profile & Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile & Notifications
            </CardTitle>
            <CardDescription>
              Update your profile and notification contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
              )}
              <div>
                <p className="font-medium">{session.user.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Display Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number (for SMS alerts)
                </label>
                <div className="flex gap-2">
                  <Select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-[140px]"
                  >
                    {COUNTRY_CODES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.code === 'OTHER' ? 'Other' : `${country.dial} ${country.code}`}
                      </option>
                    ))}
                  </Select>
                  {countryCode === 'OTHER' && (
                    <Input
                      type="text"
                      value={customDialCode}
                      onChange={(e) => setCustomDialCode(e.target.value)}
                      placeholder="+XX"
                      className="w-[80px]"
                    />
                  )}
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testSMS}
                    disabled={testingSMS || !phone}
                    title="Send test SMS"
                  >
                    {testingSMS ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select your country and enter your phone number.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email (for email alerts)
                </label>
                <div className="flex gap-2">
                  <Input
                    value={session.user.email || ''}
                    disabled
                    className="bg-muted flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testEmail}
                    disabled={testingEmail || !session.user.email}
                    title="Send test email"
                  >
                    {testingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click <Send className="w-3 h-3 inline" /> to send a test email to your account address.
                </p>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <span className={`text-sm px-2 py-1 rounded ${badge.className}`}>
                {badge.label}
              </span>
            </div>

            {session.user.subscriptionStatus === 'TRIALING' && session.user.trialEndDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Trial ends</span>
                <span className="text-sm">{formatDate(session.user.trialEndDate)}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm">Plan</span>
              <span className="text-sm">$50/month</span>
            </div>

            {session.user.stripeCustomerId && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleManageBilling}
                disabled={billingLoading}
              >
                {billingLoading ? 'Loading...' : 'Manage Billing'}
              </Button>
            )}

            {!session.user.stripeCustomerId && (
              <Link href="/checkout">
                <Button className="w-full">
                  Add Payment Method
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardContent className="py-4">
            <Button
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
