'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isValidEthAddress } from '@/lib/utils'
import { toast } from 'sonner'

interface AddWalletFormProps {
  onAdd: (address: string, label?: string) => boolean | Promise<boolean>
}

export function AddWalletForm({ onAdd }: AddWalletFormProps) {
  const [address, setAddress] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = address.trim()

    if (!trimmed) {
      toast.error('Please enter a wallet address')
      return
    }

    if (!isValidEthAddress(trimmed)) {
      toast.error('Invalid Ethereum address')
      return
    }

    setIsAdding(true)

    const success = await onAdd(trimmed)

    if (success) {
      toast.success('Wallet added')
      setAddress('')
    } else {
      toast.error('Wallet already exists')
    }

    setIsAdding(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="0x..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="flex-1 mono text-sm"
        spellCheck={false}
        autoComplete="off"
      />
      <Button type="submit" disabled={isAdding} size="md">
        <Plus className="w-4 h-4 mr-1" />
        Add
      </Button>
    </form>
  )
}
