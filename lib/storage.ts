import { Wallet } from '@/types'

const WALLETS_KEY = 'polymarket-tracker-wallets'
const LAST_SEEN_KEY = 'polymarket-tracker-last-seen'

export function getStoredWallets(): Wallet[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(WALLETS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function setStoredWallets(wallets: Wallet[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets))
}

export function addStoredWallet(address: string, label?: string): Wallet[] {
  const wallets = getStoredWallets()
  const normalized = address.toLowerCase()

  if (wallets.some((w) => w.address.toLowerCase() === normalized)) {
    return wallets
  }

  const newWallet: Wallet = {
    address: normalized,
    label,
    addedAt: new Date().toISOString(),
  }

  const updated = [...wallets, newWallet]
  setStoredWallets(updated)
  return updated
}

export function removeStoredWallet(address: string): Wallet[] {
  const wallets = getStoredWallets()
  const normalized = address.toLowerCase()
  const updated = wallets.filter((w) => w.address.toLowerCase() !== normalized)
  setStoredWallets(updated)
  return updated
}

export function getLastSeenTradeId(walletAddress: string): string | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(LAST_SEEN_KEY)
    const data = stored ? JSON.parse(stored) : {}
    return data[walletAddress.toLowerCase()] || null
  } catch {
    return null
  }
}

export function setLastSeenTradeId(walletAddress: string, tradeId: string): void {
  if (typeof window === 'undefined') return

  try {
    const stored = localStorage.getItem(LAST_SEEN_KEY)
    const data = stored ? JSON.parse(stored) : {}
    data[walletAddress.toLowerCase()] = tradeId
    localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}
