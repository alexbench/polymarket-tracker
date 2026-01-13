'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const MIGRATION_KEY = 'polymarket-tracker-migrated'

export function useMigration() {
  const { data: session } = useSession()
  const [migrating, setMigrating] = useState(false)

  useEffect(() => {
    async function migrateData() {
      if (!session?.user?.id) return

      // Check if already migrated
      const migrated = localStorage.getItem(`${MIGRATION_KEY}-${session.user.id}`)
      if (migrated) return

      // Get localStorage data
      const walletsJson = localStorage.getItem('polymarket-tracker-wallets')
      const phone = localStorage.getItem('polymarket-tracker-phone')
      const email = localStorage.getItem('polymarket-tracker-email')

      if (!walletsJson && !phone && !email) {
        localStorage.setItem(`${MIGRATION_KEY}-${session.user.id}`, 'true')
        return
      }

      setMigrating(true)

      try {
        const wallets = walletsJson ? JSON.parse(walletsJson) : []

        await fetch('/api/migrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallets, phone, email }),
        })

        // Clear localStorage after successful migration
        localStorage.removeItem('polymarket-tracker-wallets')
        localStorage.removeItem('polymarket-tracker-phone')
        localStorage.removeItem('polymarket-tracker-email')
        localStorage.removeItem('polymarket-tracker-last-seen')
        localStorage.setItem(`${MIGRATION_KEY}-${session.user.id}`, 'true')
      } catch (error) {
        console.error('Migration failed:', error)
      } finally {
        setMigrating(false)
      }
    }

    migrateData()
  }, [session?.user?.id])

  return { migrating }
}
