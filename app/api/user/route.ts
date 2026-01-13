import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      image: true,
      emailVerified: true,
      subscriptionStatus: true,
      trialStartDate: true,
      trialEndDate: true,
      currentPeriodEnd: true,
      stripeCustomerId: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { phone, name } = body

  // Validate phone format if provided
  if (phone !== undefined && phone !== null && phone !== '') {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Include country code.' },
        { status: 400 }
      )
    }
  }

  const updateData: { phone?: string | null; name?: string } = {}

  if (phone !== undefined) {
    updateData.phone = phone ? phone.replace(/[\s\-\(\)]/g, '') : null
  }

  if (name !== undefined) {
    updateData.name = name
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      subscriptionStatus: true,
    },
  })

  return NextResponse.json(user)
}
