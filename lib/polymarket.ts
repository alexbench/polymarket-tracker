import { Trade } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_POLYMARKET_API_URL || 'https://data-api.polymarket.com'

export interface FetchActivityOptions {
  limit?: number
  offset?: number
}

export async function fetchWalletActivity(
  address: string,
  options: FetchActivityOptions = {}
): Promise<Trade[]> {
  const params = new URLSearchParams({
    user: address.toLowerCase(),
    limit: String(options.limit || 50),
  })

  if (options.offset) {
    params.set('offset', String(options.offset))
  }

  const response = await fetch(`${BASE_URL}/activity?${params}`, {
    headers: {
      Accept: 'application/json',
    },
    next: { revalidate: 30 },
  })

  if (!response.ok) {
    throw new Error(`Polymarket API error: ${response.status}`)
  }

  const data = await response.json()

  // Map API response to our Trade type
  return data.map((item: any) => {
    // Handle timestamp - could be Unix seconds, milliseconds, or ISO string
    let timestamp = item.timestamp
    if (typeof timestamp === 'number') {
      // If it's a small number, it's probably seconds - convert to ms
      if (timestamp < 10000000000) {
        timestamp = new Date(timestamp * 1000).toISOString()
      } else {
        timestamp = new Date(timestamp).toISOString()
      }
    } else if (!timestamp) {
      timestamp = new Date().toISOString()
    }

    return {
      id: item.id || `${item.transactionHash}-${item.timestamp}`,
      proxyWallet: item.proxyWallet || address,
      conditionId: item.conditionId || '',
      type: item.type || 'TRADE',
      timestamp,
      title: item.title || item.market || item.question || 'Unknown Market',
      slug: item.slug || item.marketSlug || '',
      eventSlug: item.eventSlug || item.event || '',
      outcome: item.outcome || '',
      side: item.side || 'BUY',
      usdcSize: item.usdcSize || item.amount || '0',
      price: item.price || '0',
      size: item.size || item.shares || '0',
      transactionHash: item.transactionHash || '',
    }
  })
}

export async function fetchMultipleWalletActivity(
  addresses: string[],
  options: FetchActivityOptions = {}
): Promise<Trade[]> {
  const results = await Promise.all(
    addresses.map((addr) => fetchWalletActivity(addr, options).catch(() => []))
  )

  // Combine and sort by timestamp (most recent first)
  return results
    .flat()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}
