import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, sendTradeAlertEmail } from '@/lib/resend'
import { Trade } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, trades } = body

    if (!to) {
      return NextResponse.json({ error: 'Missing email address' }, { status: 400 })
    }

    let success: boolean

    if (trades && Array.isArray(trades) && trades.length > 0) {
      success = await sendTradeAlertEmail(to, trades as Trade[])
    } else if (subject && html) {
      success = await sendEmail(to, subject, html)
    } else {
      return NextResponse.json(
        { error: 'Missing trades or subject/html' },
        { status: 400 }
      )
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ sent: true })
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
