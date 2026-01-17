export type ActivityType = 'TRADE' | 'SPLIT' | 'MERGE' | 'REDEEM' | 'REWARD' | 'CONVERSION'

export interface Trade {
  id: string
  proxyWallet: string
  conditionId: string
  type: ActivityType
  timestamp: string
  title: string
  slug: string
  eventSlug: string
  outcome: string
  side: 'BUY' | 'SELL'
  usdcSize: string
  price: string
  size: string
  transactionHash: string
}

export interface Wallet {
  address: string
  label?: string
  addedAt: string
}

export interface Subscription {
  id: string
  identifier: string
  type: 'sms' | 'email'
  wallets: string[]
  lastChecked: string
  lastTradeIds: Record<string, string>
  createdAt: string
  active: boolean
}

export interface InAppNotification {
  id: string
  type: 'trade' | 'info' | 'error'
  title: string
  message: string
  trade?: Trade
  read: boolean
  createdAt: string
}

// Leaderboard types
export type LeaderboardTimeFilter = 'DAY' | 'WEEK' | 'MONTH' | 'ALL'
export type LeaderboardSortBy = 'PNL' | 'VOL'

export interface LeaderboardEntry {
  rank: number
  proxyWallet: string
  userName: string
  xUsername: string
  verifiedBadge: boolean
  vol: number
  pnl: number
  profileImage: string
}

// NextAuth type extensions
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      phone?: string | null
      emailVerified?: Date | null
      subscriptionStatus: string
      trialEndDate?: Date
      stripeCustomerId?: string | null
      hasActiveSubscription: boolean
    }
  }
}
