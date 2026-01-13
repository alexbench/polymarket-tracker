import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Trade } from '@/types'
import { formatUSD, shortenAddress } from '@/lib/utils'

interface ActivityItemProps {
  trade: Trade
  showWallet?: boolean
}

export function ActivityItem({ trade, showWallet = true }: ActivityItemProps) {
  const isBuy = trade.side === 'BUY'

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-card-hover transition-colors">
      <div
        className={`mt-0.5 p-1.5 ${
          isBuy ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
        }`}
      >
        {isBuy ? (
          <ArrowUpRight className="w-4 h-4" />
        ) : (
          <ArrowDownRight className="w-4 h-4" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-tight line-clamp-2">
          {trade.title}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span
            className={`font-medium ${
              isBuy ? 'text-accent' : 'text-destructive'
            }`}
          >
            {trade.side}
          </span>
          <span>{trade.outcome}</span>
          <span>@</span>
          <span className="mono">${parseFloat(trade.price).toFixed(2)}</span>
          {showWallet && (
            <>
              <span className="text-border">|</span>
              <span className="mono">{shortenAddress(trade.proxyWallet)}</span>
            </>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <p
          className={`text-sm font-medium mono ${
            isBuy ? 'text-accent' : 'text-destructive'
          }`}
        >
          {isBuy ? '+' : '-'}{formatUSD(trade.usdcSize)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}
