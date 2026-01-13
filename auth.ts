import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign in, fetch user data and store in token
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            phone: true,
            emailVerified: true,
            subscriptionStatus: true,
            trialEndDate: true,
            stripeCustomerId: true,
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.email = dbUser.email
          token.name = dbUser.name
          token.picture = dbUser.image
          token.phone = dbUser.phone
          token.emailVerified = dbUser.emailVerified
          token.subscriptionStatus = dbUser.subscriptionStatus
          token.trialEndDate = dbUser.trialEndDate?.toISOString()
          token.stripeCustomerId = dbUser.stripeCustomerId
        }
      }

      // Allow updating session from client
      if (trigger === 'update' && session) {
        return { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      // Pass token data to session - no Prisma call here (Edge-safe)
      session.user.id = token.id as string
      session.user.phone = token.phone as string | null
      session.user.emailVerified = token.emailVerified as Date | null
      session.user.subscriptionStatus = (token.subscriptionStatus as string) || 'NONE'
      session.user.trialEndDate = token.trialEndDate ? new Date(token.trialEndDate as string) : undefined
      session.user.stripeCustomerId = token.stripeCustomerId as string | null
      session.user.hasActiveSubscription =
        token.subscriptionStatus === 'ACTIVE' ||
        token.subscriptionStatus === 'TRIALING'

      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  events: {
    async createUser({ user }) {
      // Start 7-day free trial for new users (Google OAuth)
      const trialStart = new Date()
      const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'TRIALING',
          trialStartDate: trialStart,
          trialEndDate: trialEnd,
        },
      })
    },
  },
})
