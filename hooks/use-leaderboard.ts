'use client'

import useSWR from 'swr'
import { LeaderboardEntry, LeaderboardTimeFilter, LeaderboardSortBy } from '@/types'

interface UseLeaderboardOptions {
  timePeriod?: LeaderboardTimeFilter
  orderBy?: LeaderboardSortBy
  limit?: number
  refreshInterval?: number
}

async function fetcher(url: string): Promise<LeaderboardEntry[]> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard')
  }
  return response.json()
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const { timePeriod = 'ALL', orderBy = 'PNL', limit = 50, refreshInterval = 60000 } = options

  const params = new URLSearchParams({
    timePeriod,
    orderBy,
    limit: String(limit),
  })

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `/api/leaderboard?${params}`,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  const refresh = async () => {
    await mutate()
  }

  return {
    leaderboard: Array.isArray(data) ? data : [],
    error,
    isLoading: isLoading || isValidating,
    refresh,
  }
}
