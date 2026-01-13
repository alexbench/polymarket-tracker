'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Wallet } from '@/types'
import {
  getStoredWallets,
  addStoredWallet,
  removeStoredWallet,
} from '@/lib/storage'
import { isValidEthAddress } from '@/lib/utils'

export function useWallets() {
  const { data: session } = useSession()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch wallets from server if authenticated, otherwise use localStorage
  useEffect(() => {
    async function fetchWallets() {
      if (session?.user?.id) {
        try {
          const res = await fetch('/api/wallets')
          if (res.ok) {
            const data = await res.json()
            setWallets(data.wallets)
          }
        } catch (error) {
          console.error('Failed to fetch wallets:', error)
        }
      } else {
        setWallets(getStoredWallets())
      }
      setIsLoading(false)
    }

    fetchWallets()
  }, [session?.user?.id])

  const addWallet = useCallback(
    async (address: string, label?: string): Promise<boolean> => {
      if (!isValidEthAddress(address)) return false

      if (session?.user?.id) {
        try {
          const res = await fetch('/api/wallets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, label }),
          })
          if (res.ok) {
            const data = await res.json()
            setWallets(data.wallets)
            return true
          }
        } catch (error) {
          console.error('Failed to add wallet:', error)
        }
        return false
      } else {
        const updated = addStoredWallet(address, label)
        setWallets(updated)
        return updated.length > wallets.length
      }
    },
    [session?.user?.id, wallets.length]
  )

  const removeWallet = useCallback(
    async (address: string) => {
      if (session?.user?.id) {
        try {
          await fetch(`/api/wallets?address=${encodeURIComponent(address)}`, {
            method: 'DELETE',
          })
          setWallets((prev) =>
            prev.filter(
              (w) => w.address.toLowerCase() !== address.toLowerCase()
            )
          )
        } catch (error) {
          console.error('Failed to remove wallet:', error)
        }
      } else {
        const updated = removeStoredWallet(address)
        setWallets(updated)
      }
    },
    [session?.user?.id]
  )

  const updateLabel = useCallback(
    async (address: string, label: string) => {
      if (session?.user?.id) {
        try {
          await fetch('/api/wallets', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, label }),
          })
          setWallets((prev) =>
            prev.map((w) =>
              w.address.toLowerCase() === address.toLowerCase()
                ? { ...w, label }
                : w
            )
          )
        } catch (error) {
          console.error('Failed to update wallet:', error)
        }
      } else {
        const updated = wallets.map((w) =>
          w.address.toLowerCase() === address.toLowerCase()
            ? { ...w, label }
            : w
        )
        setWallets(updated)
        localStorage.setItem(
          'polymarket-tracker-wallets',
          JSON.stringify(updated)
        )
      }
    },
    [session?.user?.id, wallets]
  )

  return {
    wallets,
    isLoading,
    addWallet,
    removeWallet,
    updateLabel,
  }
}
