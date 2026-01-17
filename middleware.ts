import { auth } from '@/auth'
import { NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/account', '/onboarding', '/settings']
// API routes that require auth
const protectedApiRoutes = ['/api/wallets', '/api/subscriptions', '/api/user']
// Routes that require active subscription
const subscriptionRequiredRoutes = ['/account', '/onboarding', '/settings']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth
  const subscriptionStatus = req.auth?.user?.subscriptionStatus

  // Check protected routes
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isProtectedApi = protectedApiRoutes.some((route) => pathname.startsWith(route))
  const requiresSubscription = subscriptionRequiredRoutes.some((route) => pathname.startsWith(route))

  // Allow checkout page for authenticated users
  if (pathname === '/checkout') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', '/checkout')
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Unauthenticated users trying to access protected routes
  if ((isProtectedRoute || isProtectedApi) && !isAuthenticated) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated users without active subscription trying to access subscription-required routes
  if (isAuthenticated && requiresSubscription) {
    const hasActiveSubscription =
      subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIALING'

    if (!hasActiveSubscription) {
      // Redirect to checkout
      return NextResponse.redirect(new URL('/checkout', req.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    // If user doesn't have active subscription, redirect to checkout
    const hasActiveSubscription =
      subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIALING'

    if (!hasActiveSubscription) {
      return NextResponse.redirect(new URL('/checkout', req.url))
    }

    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api/auth|api/stripe/webhook|forgot-password|reset-password).*)'],
}
