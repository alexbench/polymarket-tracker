import { prisma } from '@/lib/prisma'

export type SubscriptionAccess = {
  hasAccess: boolean
  status: string
  isTrialing: boolean
  trialDaysLeft: number | null
  requiresPayment: boolean
}

export async function checkSubscriptionAccess(userId: string): Promise<SubscriptionAccess> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      trialEndDate: true,
      currentPeriodEnd: true,
    },
  })

  if (!user) {
    return {
      hasAccess: false,
      status: 'NONE',
      isTrialing: false,
      trialDaysLeft: null,
      requiresPayment: true,
    }
  }

  const now = new Date()
  const isTrialing = user.subscriptionStatus === 'TRIALING'
  const trialExpired = user.trialEndDate && new Date(user.trialEndDate) < now

  let trialDaysLeft: number | null = null
  if (isTrialing && user.trialEndDate) {
    trialDaysLeft = Math.ceil(
      (new Date(user.trialEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  const hasAccess =
    user.subscriptionStatus === 'ACTIVE' ||
    (isTrialing && !trialExpired)

  return {
    hasAccess,
    status: user.subscriptionStatus,
    isTrialing: isTrialing && !trialExpired,
    trialDaysLeft: trialDaysLeft && trialDaysLeft > 0 ? trialDaysLeft : null,
    requiresPayment: !hasAccess || (isTrialing && (trialDaysLeft || 0) <= 2),
  }
}
