import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchWalletActivity } from '@/lib/polymarket'
import { sendTradeAlertSMS } from '@/lib/twilio'
import { sendTradeAlertEmail } from '@/lib/resend'
import { Trade } from '@/types'
import { kv } from '@vercel/kv'

export const runtime = 'nodejs'
export const maxDuration = 60

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

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: {
    userId: string
    wallet: string
    newTrades: number
    notifiedSMS: boolean
    notifiedEmail: boolean
  }[] = []

  try {
    // Get all users with active subscriptions who have wallets and contact info
    const users = await prisma.user.findMany({
      where: {
        subscriptionStatus: { in: ['ACTIVE', 'TRIALING'] },
        wallets: { some: {} },
      },
      include: {
        wallets: true,
      },
    })

    // Filter to users with phone or email
    const usersWithContact = users.filter(u => u.phone || u.email)

    if (usersWithContact.length === 0) {
      return NextResponse.json({ message: 'No active users with wallets and contact info', results: [] })
    }

    for (const user of usersWithContact) {
      for (const wallet of user.wallets) {
        try {
          const trades = await fetchWalletActivity(wallet.address, { limit: 10 })

          if (trades.length === 0) continue

          const lastSeenId = await getLastTradeId(user.id, wallet.address)
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
            await setLastTradeId(user.id, wallet.address, trades[0].id)
            results.push({
              userId: user.id,
              wallet: wallet.address,
              newTrades: 0,
              notifiedSMS: false,
              notifiedEmail: false,
            })
            continue
          }

          if (newTrades.length > 0) {
            let notifiedSMS = false
            let notifiedEmail = false

            // Send SMS if user has phone number
            if (user.phone) {
              notifiedSMS = await sendTradeAlertSMS(user.phone, newTrades[0])
            }

            // Send email if user has email
            if (user.email) {
              notifiedEmail = await sendTradeAlertEmail(user.email, newTrades)
            }

            // Update last seen trade
            await setLastTradeId(user.id, wallet.address, trades[0].id)

            results.push({
              userId: user.id,
              wallet: wallet.address,
              newTrades: newTrades.length,
              notifiedSMS,
              notifiedEmail,
            })
          }
        } catch (error) {
          console.error(`Error polling wallet ${wallet.address}:`, error)
        }
      }
    }

    return NextResponse.json({
      message: 'Poll completed',
      usersChecked: usersWithContact.length,
      results,
    })
  } catch (error) {
    console.error('Cron poll error:', error)
    return NextResponse.json({ error: 'Poll failed' }, { status: 500 })
  }
}
