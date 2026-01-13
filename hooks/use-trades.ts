'use client'

import useSWR from 'swr'
import { Trade } from '@/types'
import { fetchMultipleWalletActivity } from '@/lib/polymarket'

interface UseTradesOptions {
  refreshInterval?: number
  limit?: number
}

async function fetcher([, addresses, limit]: [string, string[], number]): Promise<Trade[]> {
  if (addresses.length === 0) return []
  return fetchMultipleWalletActivity(addresses, { limit })
}

export function useTrades(walletAddresses: string[], options: UseTradesOptions = {}) {
  const { refreshInterval = 30000, limit = 50 } = options

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    walletAddresses.length > 0 ? ['trades', walletAddresses, limit] : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  )

  const refresh = async () => {
    await mutate()
  }

  return {
    trades: Array.isArray(data) ? data : [],
    error,
    isLoading: isLoading || isValidating,
    refresh,
  }
}
