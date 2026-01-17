import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Check if this is a new user registration (has registration metadata)
      // New user creation is handled by the complete-registration route
      if (session.metadata?.registrationEmail) {
        // This is a registration checkout - user will be created by complete-registration
        // Just log and skip
        console.log('Registration checkout completed for:', session.metadata.registrationEmail)
        break
      }

      // Existing user checkout flow
      const userId =
        session.metadata?.userId ||
        (await getUserIdFromCustomer(session.customer as string))

      if (userId && session.subscription) {
        // Get subscription details to check if it's a trial
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        ) as Stripe.Subscription

        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null

        // Get current period end from the first subscription item
        const currentPeriodEnd = subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000)
          : null

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: session.customer as string,
            subscriptionId: session.subscription as string,
            subscriptionStatus: subscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
            trialEndDate: trialEnd,
            currentPeriodEnd,
          },
        })
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId =
        subscription.metadata?.userId ||
        (await getUserIdFromCustomer(subscription.customer as string))

      if (userId) {
        const status = mapStripeStatus(subscription.status)
        const currentPeriodEnd = subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000)
          : null

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: status as any,
            currentPeriodEnd,
          },
        })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const userId = await getUserIdFromCustomer(invoice.customer as string)

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: 'PAST_DUE' },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

async function getUserIdFromCustomer(
  customerId: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  })
  return user?.id || null
}

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    trialing: 'TRIALING',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'EXPIRED',
    incomplete: 'NONE',
    incomplete_expired: 'EXPIRED',
    paused: 'CANCELED',
  }
  return statusMap[status] || 'NONE'
}
