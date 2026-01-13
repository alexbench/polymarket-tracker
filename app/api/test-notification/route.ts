import { NextRequest, NextResponse } from 'next/server'
import { sendTradeAlertSMS } from '@/lib/twilio'
import { sendTradeAlertEmail } from '@/lib/resend'
import { Trade } from '@/types'

// Sample trade for testing
const sampleTrade: Trade = {
  id: 'test-trade-001',
  proxyWallet: '0x1234567890abcdef1234567890abcdef12345678',
  conditionId: 'test-condition',
  type: 'TRADE',
  timestamp: new Date().toISOString(),
  title: 'Will Bitcoin reach $100k by end of 2025?',
  slug: 'will-bitcoin-reach-100k-by-end-of-2025',
  eventSlug: 'bitcoin-100k-2025',
  outcome: 'Yes',
  side: 'BUY',
  usdcSize: '250.00',
  price: '0.65',
  size: '384.62',
  transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to } = body

    if (!type || !to) {
      return NextResponse.json(
        { error: 'Missing type or recipient' },
        { status: 400 }
      )
    }

    let success = false

    if (type === 'sms') {
      success = await sendTradeAlertSMS(to, sampleTrade)
    } else if (type === 'email') {
      success = await sendTradeAlertEmail(to, [sampleTrade])
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "sms" or "email"' },
        { status: 400 }
      )
    }

    if (!success) {
      return NextResponse.json(
        { error: `Failed to send test ${type}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, type })
  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}
