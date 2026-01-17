'use client'

import { LeaderboardEntry } from '@/types'
import { shortenAddress, formatUSD } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Trophy, Medal, Award, BadgeCheck, ExternalLink } from 'lucide-react'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  isLoading: boolean
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Trophy className="w-5 h-5 text-yellow-500" />
  }
  if (rank === 2) {
    return <Medal className="w-5 h-5 text-gray-400" />
  }
  if (rank === 3) {
    return <Award className="w-5 h-5 text-amber-600" />
  }
  return <span className="text-sm text-muted-foreground w-5 text-center">{rank}</span>
}

function formatCompactUSD(amount: number): string {
  const absAmount = Math.abs(amount)
  if (absAmount >= 1_000_000) {
    return `${amount >= 0 ? '+' : '-'}$${(absAmount / 1_000_000).toFixed(2)}M`
  }
  if (absAmount >= 1_000) {
    return `${amount >= 0 ? '+' : '-'}$${(absAmount / 1_000).toFixed(1)}K`
  }
  return `${amount >= 0 ? '+' : ''}${formatUSD(amount)}`
}

function formatVolume(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`
  }
  return formatUSD(amount)
}

export function LeaderboardTable({ entries, isLoading }: LeaderboardTableProps) {
  if (isLoading && entries.length === 0) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 py-3">
            <div className="w-8 h-8 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted w-1/3" />
              <div className="h-3 bg-muted w-1/4" />
            </div>
            <div className="h-4 bg-muted w-20" />
            <div className="h-4 bg-muted w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
        <p>No leaderboard data available</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {entries.map((entry) => (
        <div
          key={entry.proxyWallet}
          className="flex items-center gap-4 px-4 py-3 hover:bg-card-hover transition-colors"
        >
          <div className="flex items-center justify-center w-8">
            <RankBadge rank={entry.rank} />
          </div>

          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
            {entry.profileImage ? (
              <img
                src={entry.profileImage}
                alt={entry.userName || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-muted-foreground">
                {(entry.userName || entry.proxyWallet.slice(2, 4)).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm truncate">
                {entry.userName || 'Anonymous'}
              </span>
              {entry.verifiedBadge && (
                <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <a
              href={`https://polymarket.com/profile/${entry.proxyWallet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              {shortenAddress(entry.proxyWallet)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-right">
            <div
              className={cn(
                'text-sm font-medium',
                entry.pnl >= 0 ? 'text-green-500' : 'text-red-500'
              )}
            >
              {formatCompactUSD(entry.pnl)}
            </div>
            <div className="text-xs text-muted-foreground">PnL</div>
          </div>

          <div className="text-right w-20">
            <div className="text-sm">{formatVolume(entry.vol)}</div>
            <div className="text-xs text-muted-foreground">Volume</div>
          </div>
        </div>
      ))}
    </div>
  )
}
