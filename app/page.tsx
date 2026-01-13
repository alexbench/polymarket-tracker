import { auth } from '@/auth'
import { LandingPage } from '@/components/landing-page'
import { Dashboard } from '@/components/dashboard'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()

  // If not logged in, show landing page
  if (!session) {
    return <LandingPage />
  }

  // If logged in but email not verified, redirect to verify page
  // (only for credential users - Google users are auto-verified)

  // If logged in but no payment method, redirect to checkout
  if (!session.user.stripeCustomerId && session.user.subscriptionStatus === 'NONE') {
    redirect('/checkout')
  }

  // If logged in but hasn't completed onboarding (no phone), redirect
  // For now, show dashboard - we'll add phone check later

  return <Dashboard />
}
