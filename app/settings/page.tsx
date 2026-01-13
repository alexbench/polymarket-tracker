'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useWallets } from '@/hooks/use-wallets'
import { NotificationSettings } from '@/components/notification-settings'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function SettingsPage() {
  const { wallets } = useWallets()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-base font-medium">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Tracked Wallets Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tracked Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              {wallets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No wallets added yet. <Link href="/" className="text-accent hover:underline">Add wallets</Link> to enable notifications.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Tracking {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
                  </p>
                  <div className="text-xs mono text-muted-foreground space-y-1">
                    {wallets.slice(0, 5).map((w) => (
                      <p key={w.address} className="truncate">
                        {w.label ? `${w.label}: ` : ''}{w.address}
                      </p>
                    ))}
                    {wallets.length > 5 && (
                      <p>+ {wallets.length - 5} more</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <div>
            <h2 className="text-sm font-medium mb-4">Notifications</h2>
            <NotificationSettings wallets={wallets} />
          </div>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                PolyTrax monitors wallet activity on Polymarket and sends notifications when new trades occur.
              </p>
              <p>
                Data is fetched from the Polymarket Data API. Wallet addresses are stored locally in your browser.
              </p>
              <p className="text-xs">
                Notifications require Vercel KV, Twilio (SMS), and Resend (email) configuration.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
