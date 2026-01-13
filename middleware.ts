import { auth } from '@/auth'
import { NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/account', '/onboarding', '/checkout']
// API routes that require auth
const protectedApiRoutes = ['/api/wallets', '/api/subscriptions', '/api/user']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Check protected routes
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isProtectedApi = protectedApiRoutes.some((route) => pathname.startsWith(route))

  if ((isProtectedRoute || isProtectedApi) && !isAuthenticated) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api/auth|api/stripe/webhook).*)'],
}
