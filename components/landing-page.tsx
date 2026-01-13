'use client'

import Link from 'next/link'
import { Bell, TrendingUp, Wallet, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-base font-medium">PolyTrax</h1>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold tracking-tight">
            Track Polymarket Wallets in Real-Time
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant SMS and email notifications when the wallets you follow make trades.
            Never miss a move from your favorite traders.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg">
                Start 7-Day Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required to start. $50/month after trial.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Track Any Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Add any Polymarket wallet address and monitor their trading activity in real-time.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Instant Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Receive SMS and email alerts the moment a tracked wallet makes a trade.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Act Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Each alert includes a direct link to the market so you can take action immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-8">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto font-semibold">1</div>
              <p className="text-sm">Create an account</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto font-semibold">2</div>
              <p className="text-sm">Add wallet addresses to track</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto font-semibold">3</div>
              <p className="text-sm">Set up SMS/email alerts</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto font-semibold">4</div>
              <p className="text-sm">Get notified of every trade</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>PolyTrax - Real-time wallet monitoring for prediction markets</p>
        </div>
      </footer>
    </div>
  )
}
