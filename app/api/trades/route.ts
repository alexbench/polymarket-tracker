import { NextRequest, NextResponse } from 'next/server'
import { fetchMultipleWalletActivity } from '@/lib/polymarket'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const walletsParam = searchParams.get('wallets')
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  if (!walletsParam) {
    return NextResponse.json({ error: 'Missing wallets parameter' }, { status: 400 })
  }

  const wallets = walletsParam.split(',').filter(Boolean)

  if (wallets.length === 0) {
    return NextResponse.json({ error: 'No valid wallets provided' }, { status: 400 })
  }

  try {
    const trades = await fetchMultipleWalletActivity(wallets, { limit })
    return NextResponse.json(trades)
  } catch (error) {
    console.error('Failed to fetch trades:', error)
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
  }
}
