import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import ProfileClient from './ProfileClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mon profil',
  description: 'Gérez votre profil Elwarcha.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    }
  })

  if (!user) {
    redirect('/signin')
  }

  // Get orders count separately
  const ordersCount = await prisma.order.count({
    where: { customerId: user.id }
  })

  return (
    <ProfileClient 
      user={{
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        ordersCount
      }} 
    />
  )
}
