import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { wallets, phone, email } = await request.json()

  // Migrate wallets
  if (wallets && Array.isArray(wallets)) {
    for (const wallet of wallets) {
      try {
        await prisma.wallet.create({
          data: {
            address: wallet.address.toLowerCase(),
            label: wallet.label,
            userId: session.user.id,
            addedAt: wallet.addedAt ? new Date(wallet.addedAt) : new Date(),
          },
        })
      } catch (error) {
        // Ignore duplicate errors
      }
    }
  }

  // Update phone if provided
  if (phone) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { phone },
    })
  }

  return NextResponse.json({ migrated: true })
}
