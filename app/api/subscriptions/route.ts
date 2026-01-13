import { NextRequest, NextResponse } from 'next/server'
import {
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '@/lib/kv'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const identifier = searchParams.get('identifier')

  if (!identifier) {
    return NextResponse.json({ error: 'Missing identifier' }, { status: 400 })
  }

  const subscription = await getSubscription(identifier)

  if (!subscription) {
    return NextResponse.json({ exists: false })
  }

  return NextResponse.json({ exists: true, subscription })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, type, wallets } = body

    if (!identifier || !type || !wallets) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (type !== 'sms' && type !== 'email') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "sms" or "email"' },
        { status: 400 }
      )
    }

    if (!Array.isArray(wallets) || wallets.length === 0) {
      return NextResponse.json(
        { error: 'Wallets must be a non-empty array' },
        { status: 400 }
      )
    }

    // Check if subscription already exists
    const existing = await getSubscription(identifier)

    if (existing) {
      // Update existing subscription
      const updated = await updateSubscription(identifier, { wallets, active: true })
      return NextResponse.json({ subscription: updated, updated: true })
    }

    // Create new subscription
    const subscription = await createSubscription(identifier, type, wallets)
    return NextResponse.json({ subscription, created: true })
  } catch (error) {
    console.error('Failed to create subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const identifier = searchParams.get('identifier')

  if (!identifier) {
    return NextResponse.json({ error: 'Missing identifier' }, { status: 400 })
  }

  const success = await deleteSubscription(identifier)

  if (!success) {
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }

  return NextResponse.json({ deleted: true })
}
