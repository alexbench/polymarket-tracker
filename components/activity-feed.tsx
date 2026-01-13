'use client'

import { RefreshCw } from 'lucide-react'
import { Trade } from '@/types'
import { ActivityItem } from './activity-item'
import { Button } from '@/components/ui/button'

interface ActivityFeedProps {
  trades: Trade[]
  isLoading: boolean
  onRefresh: () => void
  showWallet?: boolean
}

export function ActivityFeed({ trades: rawTrades, isLoading, onRefresh, showWallet = true }: ActivityFeedProps) {
  // Ensure trades is always an array
  const trades = Array.isArray(rawTrades) ? rawTrades : []

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-medium">Activity</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-7 px-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-auto relative">
        {/* Loading overlay when refreshing with existing data */}
        {isLoading && trades.length > 0 && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-2 shadow-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Refreshing...</span>
            </div>
          </div>
        )}

        {isLoading && trades.length === 0 ? (
          <div className="space-y-1 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted w-3/4" />
                  <div className="h-3 bg-muted w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-12">
            <p>No activity yet</p>
            <p className="text-xs mt-1">Add wallets to start tracking</p>
          </div>
        ) : (
          <div>
            {trades.map((trade) => (
              <ActivityItem key={trade.id} trade={trade} showWallet={showWallet} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
