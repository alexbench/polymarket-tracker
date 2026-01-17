import { NextRequest, NextResponse } from 'next/server'
import { fetchLeaderboard } from '@/lib/polymarket'
import { LeaderboardTimeFilter, LeaderboardSortBy } from '@/types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const timePeriod = (searchParams.get('timePeriod') || 'ALL') as LeaderboardTimeFilter
  const orderBy = (searchParams.get('orderBy') || 'PNL') as LeaderboardSortBy
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  // Validate timePeriod parameter
  const validTimePeriods: LeaderboardTimeFilter[] = ['DAY', 'WEEK', 'MONTH', 'ALL']
  if (!validTimePeriods.includes(timePeriod)) {
    return NextResponse.json({ error: 'Invalid timePeriod parameter' }, { status: 400 })
  }

  // Validate orderBy parameter
  const validOrderBy: LeaderboardSortBy[] = ['PNL', 'VOL']
  if (!validOrderBy.includes(orderBy)) {
    return NextResponse.json({ error: 'Invalid orderBy parameter' }, { status: 400 })
  }

  try {
    const leaderboard = await fetchLeaderboard({ timePeriod, orderBy, limit })
    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
