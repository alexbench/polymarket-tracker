import { Resend } from 'resend'
import { Trade } from '@/types'
import { shortenAddress, formatUSD, getPolymarketTradeUrl } from './utils'

let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

export function formatTradeForEmail(trades: Trade[]): { subject: string; html: string } {
  const trade = trades[0]
  const wallet = shortenAddress(trade.proxyWallet)
  const action = trade.side === 'BUY' ? 'bought' : 'sold'

  const subject = trades.length === 1
    ? `${wallet} ${action} ${trade.outcome}`
    : `${trades.length} new trades from ${wallet}`

  const tradesHtml = trades
    .map((t) => {
      const isBuy = t.side === 'BUY'
      const color = isBuy ? '#22c55e' : '#ef4444'
      const arrow = isBuy ? '↑' : '↓'
      const marketUrl = getPolymarketTradeUrl(t.eventSlug, t.slug, t.title)

      return `
        <div style="padding: 16px 0; border-bottom: 1px solid #262626;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="color: ${color}; font-size: 20px;">${arrow}</span>
            <div style="flex: 1;">
              <p style="margin: 0 0 8px 0; color: #fafafa; font-size: 14px;">
                ${t.title}
              </p>
              <p style="margin: 0 0 8px 0; color: #a3a3a3; font-size: 12px;">
                <span style="color: ${color}; font-weight: 500;">${t.side}</span>
                ${t.outcome} @ $${parseFloat(t.price).toFixed(2)}
              </p>
              <a href="${marketUrl}" style="color: #3b82f6; font-size: 12px; text-decoration: none;">
                View on Polymarket →
              </a>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; color: ${color}; font-family: monospace; font-size: 14px;">
                ${isBuy ? '+' : '-'}${formatUSD(t.usdcSize)}
              </p>
            </div>
          </div>
        </div>
      `
    })
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #141414;">
          <div style="padding: 20px; border-bottom: 1px solid #262626;">
            <h1 style="margin: 0; color: #fafafa; font-size: 16px; font-weight: 500;">
              PolyTrax Trade Alert
            </h1>
          </div>
          <div style="padding: 0 20px;">
            ${tradesHtml}
          </div>
          <div style="padding: 20px; color: #a3a3a3; font-size: 12px;">
            <p style="margin: 0;">
              Wallet: <span style="font-family: monospace;">${trade.proxyWallet}</span>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  return { subject, html }
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const resend = getResendClient()
    await resend.emails.send({
      from: 'PolyTrax <noreply@polytrax.io>',
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export async function sendTradeAlertEmail(to: string, trades: Trade[]): Promise<boolean> {
  const { subject, html } = formatTradeForEmail(trades)
  return sendEmail(to, subject, html)
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const subject = 'Reset your PolyTrax password'
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #141414;">
          <div style="padding: 20px; border-bottom: 1px solid #262626;">
            <h1 style="margin: 0; color: #fafafa; font-size: 16px; font-weight: 500;">
              PolyTrax
            </h1>
          </div>
          <div style="padding: 40px 20px;">
            <h2 style="margin: 0 0 16px 0; color: #fafafa; font-size: 20px; font-weight: 500;">
              Reset your password
            </h2>
            <p style="margin: 0 0 24px 0; color: #a3a3a3; font-size: 14px; line-height: 1.5;">
              We received a request to reset your password. Click the button below to create a new password. This link will expire in 1 hour.
            </p>
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
              <tr>
                <td style="background-color: #3b82f6; border-radius: 6px;">
                  <a href="${resetUrl}" target="_blank" style="display: inline-block; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 500;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin: 0 0 16px 0; color: #a3a3a3; font-size: 12px; line-height: 1.5;">
              Or copy and paste this link into your browser:
            </p>
            <p style="margin: 0 0 24px 0; color: #3b82f6; font-size: 12px; word-break: break-all;">
              <a href="${resetUrl}" style="color: #3b82f6; text-decoration: underline;">${resetUrl}</a>
            </p>
            <p style="margin: 0; color: #737373; font-size: 12px; line-height: 1.5;">
              If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
          <div style="padding: 20px; border-top: 1px solid #262626;">
            <p style="margin: 0; color: #525252; font-size: 12px;">
              This is an automated email from PolyTrax. Please do not reply.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
  return sendEmail(to, subject, html)
}
