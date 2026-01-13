import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function formatUSD(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatNumber(num: string | number): string {
  const n = typeof num === 'string' ? parseFloat(num) : num
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(n)
}

export function getPolymarketTradeUrl(eventSlug: string, slug?: string, title?: string): string {
  // If we have both eventSlug and slug, use the full nested URL
  if (eventSlug && slug) {
    return `https://polymarket.com/event/${eventSlug}/${slug}`
  }

  // If we only have eventSlug, use the event page
  if (eventSlug) {
    return `https://polymarket.com/event/${eventSlug}`
  }

  // If we only have slug, try it as an event
  if (slug) {
    return `https://polymarket.com/event/${slug}`
  }

  // Fallback: search for the market by title
  if (title) {
    const searchQuery = encodeURIComponent(title.slice(0, 50))
    return `https://polymarket.com/search?query=${searchQuery}`
  }

  return 'https://polymarket.com'
}

export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}
