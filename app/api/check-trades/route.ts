import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { fetchWalletActivity } from '@/lib/polymarket'
import { sendTradeAlertEmail } from '@/lib/resend'
import { Trade } from '@/types'
import { kv } from '@vercel/kv'

// Store last seen trade IDs in KV
async function getLastTradeId(userId: string, wallet: string): Promise<string | null> {
  try {
    return await kv.get(`lastTrade:${userId}:${wallet.toLowerCase()}`)
  } catch {
    return null
  }
}

async function setLastTradeId(userId: string, wallet: string, tradeId: string): Promise<void> {
  try {
    await kv.set(`lastTrade:${userId}:${wallet.toLowerCase()}`, tradeId)
  } catch (error) {
    console.error('Failed to set last trade ID:', error)
  }
}

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    // Get user with wallets
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallets: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.wallets.length === 0) {
      return NextResponse.json({ message: 'No wallets to check', results: [] })
    }

    // Check if user has active subscription
    if (!['ACTIVE', 'TRIALING'].includes(user.subscriptionStatus)) {
      return NextResponse.json({ message: 'Subscription not active', results: [] })
    }

    const results: {
      wallet: string
      newTrades: number
      notified: boolean
    }[] = []

    for (const wallet of user.wallets) {
      try {
        const trades = await fetchWalletActivity(wallet.address, { limit: 10 })

        if (trades.length === 0) continue

        const lastSeenId = await getLastTradeId(userId, wallet.address)
        let newTrades: Trade[] = []

        if (lastSeenId) {
          // Find new trades since last seen
          const lastSeenIndex = trades.findIndex((t) => t.id === lastSeenId)
          if (lastSeenIndex > 0) {
            newTrades = trades.slice(0, lastSeenIndex)
          } else if (lastSeenIndex === -1) {
            // Last seen trade not found, treat all as new (up to 5)
            newTrades = trades.slice(0, 5)
          }
        } else {
          // First time tracking, just update last seen without notifying
          await setLastTradeId(userId, wallet.address, trades[0].id)
          results.push({
            wallet: wallet.address,
            newTrades: 0,
            notified: false,
          })
          continue
        }

        if (newTrades.length > 0) {
          let notified = false

          // Send email if user has email
          if (user.email) {
            notified = await sendTradeAlertEmail(user.email, newTrades)
          }

          // Update last seen trade
          await setLastTradeId(userId, wallet.address, trades[0].id)

          results.push({
            wallet: wallet.address,
            newTrades: newTrades.length,
            notified,
          })
        }
      } catch (error) {
        console.error(`Error checking wallet ${wallet.address}:`, error)
      }
    }

    return NextResponse.json({
      message: 'Check completed',
      walletsChecked: user.wallets.length,
      results,
    })
  } catch (error) {
    console.error('Check trades error:', error)
    return NextResponse.json({ error: 'Check failed' }, { status: 500 })
  }
}
