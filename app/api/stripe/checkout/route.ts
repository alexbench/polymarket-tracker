import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { stripe, PRICE_ID } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  let body = {}
  try {
    body = await request.json()
  } catch {
    // Empty body is fine for existing user checkout
  }
  const { registration } = body as { registration?: { email: string; password: string; name?: string } }

  // New user registration flow
  if (registration) {
    const { email, password, name } = registration

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password for storing in metadata
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create checkout session with registration data in metadata
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_collection: 'always',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/complete-registration?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/register?canceled=true`,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          registrationEmail: email,
          registrationName: name || '',
          registrationPasswordHash: hashedPassword,
        },
      },
      metadata: {
        registrationEmail: email,
        registrationName: name || '',
        registrationPasswordHash: hashedPassword,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  }

  // Existing user checkout flow
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || undefined,
        metadata: { userId: user.id },
      })

      stripeCustomerId = customer.id

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      })
    }

    // Create checkout session with 7-day trial
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_collection: 'always',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId: user.id },
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
