import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, sendTradeAlertSMS } from '@/lib/twilio'
import { Trade } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, message, trade } = body

    if (!to) {
      return NextResponse.json({ error: 'Missing phone number' }, { status: 400 })
    }

    let success: boolean

    if (trade) {
      success = await sendTradeAlertSMS(to, trade as Trade)
    } else if (message) {
      success = await sendSMS(to, message)
    } else {
      return NextResponse.json(
        { error: 'Missing message or trade' },
        { status: 400 }
      )
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
    }

    return NextResponse.json({ sent: true })
  } catch (error) {
    console.error('SMS API error:', error)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}
