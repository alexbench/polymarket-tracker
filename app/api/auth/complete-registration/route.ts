import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.redirect(
      new URL('/register?error=missing_session', request.url)
    )
  }

  try {
    // Retrieve the Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    if (checkoutSession.payment_status !== 'paid' && checkoutSession.payment_status !== 'no_payment_required') {
      // For trials, payment_status is 'no_payment_required'
      if (checkoutSession.status !== 'complete') {
        return NextResponse.redirect(
          new URL('/register?error=payment_incomplete', request.url)
        )
      }
    }

    // Extract registration data from metadata
    const email = checkoutSession.metadata?.registrationEmail
    const name = checkoutSession.metadata?.registrationName
    const passwordHash = checkoutSession.metadata?.registrationPasswordHash

    if (!email || !passwordHash) {
      return NextResponse.redirect(
        new URL('/register?error=missing_registration_data', request.url)
      )
    }

    // Check if user already exists (in case of duplicate calls)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // User already created, just redirect to login
      return NextResponse.redirect(
        new URL('/login?registered=true', request.url)
      )
    }

    // Get subscription details
    const subscription = checkoutSession.subscription as any
    const trialEnd = subscription?.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null
    const currentPeriodEnd = subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : null

    // Create the user with subscription details
    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: name || null,
        stripeCustomerId: checkoutSession.customer as string,
        subscriptionId: subscription?.id || null,
        subscriptionStatus: subscription?.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
        trialStartDate: new Date(),
        trialEndDate: trialEnd,
        currentPeriodEnd,
      },
    })

    // Update Stripe customer metadata with the user ID
    if (checkoutSession.customer) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })

      if (user) {
        await stripe.customers.update(checkoutSession.customer as string, {
          metadata: { userId: user.id },
        })

        // Also update subscription metadata
        if (subscription?.id) {
          await stripe.subscriptions.update(subscription.id, {
            metadata: { userId: user.id },
          })
        }
      }
    }

    // Set a cookie to indicate successful registration
    // The user will need to log in to get a proper session
    const cookieStore = await cookies()
    cookieStore.set('registration_complete', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60, // 1 minute, just for the redirect
    })

    return NextResponse.redirect(
      new URL('/login?registered=true', request.url)
    )
  } catch (error) {
    console.error('Complete registration error:', error)
    return NextResponse.redirect(
      new URL('/register?error=registration_failed', request.url)
    )
  }
}
