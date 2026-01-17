'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { LeaderboardTable } from '@/components/leaderboard-table'
import { Button } from '@/components/ui/button'
import { LeaderboardTimeFilter, LeaderboardSortBy } from '@/types'
import { cn } from '@/lib/utils'

const TIME_FILTERS: { label: string; value: LeaderboardTimeFilter }[] = [
  { label: 'Today', value: 'DAY' },
  { label: 'Weekly', value: 'WEEK' },
  { label: 'Monthly', value: 'MONTH' },
  { label: 'All Time', value: 'ALL' },
]

const SORT_OPTIONS: { label: string; value: LeaderboardSortBy }[] = [
  { label: 'PnL', value: 'PNL' },
  { label: 'Volume', value: 'VOL' },
]

export function LeaderboardView() {
  const [timePeriod, setTimePeriod] = useState<LeaderboardTimeFilter>('ALL')
  const [orderBy, setOrderBy] = useState<LeaderboardSortBy>('PNL')

  const { leaderboard, isLoading, refresh } = useLeaderboard({
    timePeriod,
    orderBy,
    limit: 50,
    refreshInterval: 60000,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Leaderboard</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="h-7 px-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1">
            {TIME_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTimePeriod(filter.value)}
                className={cn(
                  'px-3 py-1 text-xs rounded transition-colors',
                  timePeriod === filter.value
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card-hover'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 border-l border-border pl-4">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setOrderBy(option.value)}
                className={cn(
                  'px-3 py-1 text-xs rounded transition-colors',
                  orderBy === option.value
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card-hover'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        {isLoading && leaderboard.length > 0 && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-2 shadow-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Refreshing...</span>
            </div>
          </div>
        )}

        <LeaderboardTable entries={leaderboard} isLoading={isLoading} />
      </div>
    </div>
  )
}
