import twilio from 'twilio'
import { Trade } from '@/types'
import { shortenAddress, formatUSD } from './utils'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

function getClient() {
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured')
  }
  return twilio(accountSid, authToken)
}

export function formatTradeForSMS(trade: Trade): string {
  const action = trade.side === 'BUY' ? 'bought' : 'sold'
  const wallet = shortenAddress(trade.proxyWallet)
  const price = parseFloat(trade.price).toFixed(2)
  const amount = formatUSD(trade.usdcSize)

  // Keep it under 160 chars for single SMS
  const market = trade.title.length > 60 ? trade.title.slice(0, 57) + '...' : trade.title

  return `PolyTrax: ${wallet} ${action} ${trade.outcome} @ $${price} (${amount})\n${market}`
}

export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!fromNumber) {
    throw new Error('Twilio phone number not configured')
  }

  // Ensure phone number has + prefix
  const formattedTo = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`

  try {
    const client = getClient()
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedTo,
    })
    console.log('SMS sent successfully:', result.sid)
    return true
  } catch (error: any) {
    console.error('Failed to send SMS:', error?.message || error)
    return false
  }
}

export async function sendTradeAlertSMS(to: string, trade: Trade): Promise<boolean> {
  const message = formatTradeForSMS(trade)
  return sendSMS(to, message)
}
