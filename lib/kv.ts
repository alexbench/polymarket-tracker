import { kv } from '@vercel/kv'
import { Subscription } from '@/types'

const SUBSCRIPTION_PREFIX = 'subscription:'

export async function getSubscription(identifier: string): Promise<Subscription | null> {
  try {
    return await kv.get<Subscription>(`${SUBSCRIPTION_PREFIX}${identifier}`)
  } catch {
    return null
  }
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  try {
    const keys = await kv.keys(`${SUBSCRIPTION_PREFIX}*`)
    if (keys.length === 0) return []

    const subscriptions = await Promise.all(
      keys.map((key) => kv.get<Subscription>(key))
    )

    return subscriptions.filter((s): s is Subscription => s !== null && s.active)
  } catch {
    return []
  }
}

export async function createSubscription(
  identifier: string,
  type: 'sms' | 'email',
  wallets: string[]
): Promise<Subscription> {
  const subscription: Subscription = {
    id: crypto.randomUUID(),
    identifier,
    type,
    wallets,
    lastChecked: new Date().toISOString(),
    lastTradeIds: {},
    createdAt: new Date().toISOString(),
    active: true,
  }

  await kv.set(`${SUBSCRIPTION_PREFIX}${identifier}`, subscription)
  return subscription
}

export async function updateSubscription(
  identifier: string,
  updates: Partial<Subscription>
): Promise<Subscription | null> {
  const existing = await getSubscription(identifier)
  if (!existing) return null

  const updated = { ...existing, ...updates }
  await kv.set(`${SUBSCRIPTION_PREFIX}${identifier}`, updated)
  return updated
}

export async function deleteSubscription(identifier: string): Promise<boolean> {
  try {
    await kv.del(`${SUBSCRIPTION_PREFIX}${identifier}`)
    return true
  } catch {
    return false
  }
}

export async function updateLastTradeId(
  identifier: string,
  walletAddress: string,
  tradeId: string
): Promise<void> {
  const subscription = await getSubscription(identifier)
  if (!subscription) return

  subscription.lastTradeIds[walletAddress.toLowerCase()] = tradeId
  subscription.lastChecked = new Date().toISOString()

  await kv.set(`${SUBSCRIPTION_PREFIX}${identifier}`, subscription)
}
