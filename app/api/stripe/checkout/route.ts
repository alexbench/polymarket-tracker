import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { stripe, PRICE_ID } from '@/lib/stripe'

export async function POST(request: NextRequest) {
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
      email: user.email,
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
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: user.id },
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
