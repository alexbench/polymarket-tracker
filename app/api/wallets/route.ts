import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { isValidEthAddress } from '@/lib/utils'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const wallets = await prisma.wallet.findMany({
    where: { userId: session.user.id },
    orderBy: { addedAt: 'desc' },
  })

  // Transform to match client-side Wallet type
  const formattedWallets = wallets.map((w) => ({
    address: w.address,
    label: w.label,
    addedAt: w.addedAt.toISOString(),
  }))

  return NextResponse.json({ wallets: formattedWallets })
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { address, label } = await request.json()

  if (!address || !isValidEthAddress(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  const normalized = address.toLowerCase()

  try {
    await prisma.wallet.create({
      data: {
        address: normalized,
        label,
        userId: session.user.id,
      },
    })

    const wallets = await prisma.wallet.findMany({
      where: { userId: session.user.id },
      orderBy: { addedAt: 'desc' },
    })

    const formattedWallets = wallets.map((w) => ({
      address: w.address,
      label: w.label,
      addedAt: w.addedAt.toISOString(),
    }))

    return NextResponse.json({ wallets: formattedWallets })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Wallet already added' }, { status: 409 })
    }
    throw error
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { address, label } = await request.json()

  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 })
  }

  await prisma.wallet.updateMany({
    where: {
      userId: session.user.id,
      address: address.toLowerCase(),
    },
    data: { label },
  })

  return NextResponse.json({ updated: true })
}

export async function DELETE(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const address = request.nextUrl.searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 })
  }

  await prisma.wallet.deleteMany({
    where: {
      userId: session.user.id,
      address: address.toLowerCase(),
    },
  })

  return NextResponse.json({ deleted: true })
}
