'use client'

import { X, ExternalLink } from 'lucide-react'
import { Wallet } from '@/types'
import { Button } from '@/components/ui/button'
import { shortenAddress } from '@/lib/utils'

interface WalletListProps {
  wallets: Wallet[]
  onRemove: (address: string) => void
  selectedWallet?: string | null
  onSelect?: (address: string | null) => void
}

export function WalletList({ wallets, onRemove, selectedWallet, onSelect }: WalletListProps) {
  if (wallets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No wallets added yet
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {wallets.map((wallet) => (
        <div
          key={wallet.address}
          className={`flex items-center gap-3 px-3 py-2 group transition-colors cursor-pointer ${
            selectedWallet === wallet.address
              ? 'bg-card-hover'
              : 'hover:bg-card-hover'
          }`}
          onClick={() => onSelect?.(selectedWallet === wallet.address ? null : wallet.address)}
        >
          <div className="flex-1 min-w-0">
            {wallet.label && (
              <p className="text-sm font-medium text-foreground truncate">
                {wallet.label}
              </p>
            )}
            <p className="text-xs mono text-muted-foreground">
              {shortenAddress(wallet.address)}
            </p>
          </div>

          <a
            href={`https://polygonscan.com/address/${wallet.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 p-1 hover:text-accent transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(wallet.address)
            }}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
    </div>
  )
}
