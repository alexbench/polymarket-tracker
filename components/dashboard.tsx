'use client'

import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { UserMenu } from '@/components/user-menu'
import { useWallets } from '@/hooks/use-wallets'
import { useTrades } from '@/hooks/use-trades'
import { AddWalletForm } from '@/components/add-wallet-form'
import { WalletList } from '@/components/wallet-list'
import { ActivityFeed } from '@/components/activity-feed'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Dashboard() {
  const { wallets, isLoading: walletsLoading, addWallet, removeWallet } = useWallets()
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const walletAddresses = selectedWallet
    ? [selectedWallet]
    : wallets.map((w) => w.address)

  const { trades, isLoading: tradesLoading, refresh } = useTrades(walletAddresses, {
    refreshInterval: 30000,
  })

  // Poll for new trades and send notifications every 60 seconds
  useEffect(() => {
    if (wallets.length === 0) return

    const checkForTrades = async () => {
      try {
        await fetch('/api/check-trades')
      } catch (error) {
        console.error('Failed to check for trades:', error)
      }
    }

    // Check immediately on mount
    checkForTrades()

    // Then check every 60 seconds
    const interval = setInterval(checkForTrades, 60000)

    return () => clearInterval(interval)
  }, [wallets.length])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-base font-medium">PolyTrax</h1>
          <div className="flex items-center gap-2">
            <Link href="/account">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Wallets */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tracked Wallets</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b border-border">
                  <AddWalletForm onAdd={addWallet} />
                </div>
                {walletsLoading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse h-10 bg-muted" />
                    ))}
                  </div>
                ) : (
                  <WalletList
                    wallets={wallets}
                    onRemove={removeWallet}
                    selectedWallet={selectedWallet}
                    onSelect={setSelectedWallet}
                  />
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="py-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-medium mono">{wallets.length}</p>
                    <p className="text-xs text-muted-foreground">Wallets</p>
                  </div>
                  <div>
                    <p className="text-2xl font-medium mono">{trades.length}</p>
                    <p className="text-xs text-muted-foreground">Trades</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main - Activity Feed */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-180px)] flex flex-col">
              <ActivityFeed
                trades={trades}
                isLoading={tradesLoading}
                onRefresh={refresh}
                showWallet={!selectedWallet}
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
