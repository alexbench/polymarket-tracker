import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const trialStart = new Date()
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        subscriptionStatus: 'TRIALING',
        trialStartDate: trialStart,
        trialEndDate: trialEnd,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
