"use client"
import Link from 'next/link'
import { Suspense } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { AuthActions } from '@/components/AuthActions'
import { MobileNav } from '@/components/MobileNav'

/*
 * The session is read in the browser (not in the root layout) so public pages
 * stay static/ISR-cacheable instead of being rendered on every request.
 */

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
}

function useSessionUser() {
  const { data, status } = useSession()
  const user = data?.user ? { email: data.user.email ?? undefined, role: data.user.role } : null
  return { user, loading: status === 'loading' }
}

export function HeaderAccount() {
  const { user, loading } = useSessionUser()
  return (
    <>
      <div className="hidden md:flex">
        {loading ? (
          // Reserve the space of the sign-in button to avoid a layout shift
          <div className="h-9 w-28 rounded-full bg-[#E9E7DB]/70" aria-hidden="true" />
        ) : (
          <Suspense>
            <AuthActions session={user} variant="bar" />
          </Suspense>
        )}
      </div>
      <MobileNav session={user} />
    </>
  )
}

export function OrdersNavLink() {
  const { user } = useSessionUser()
  if (!user) return null
  return <Link href="/orders" className="hover:text-[#6B2D2D] transition-colors">Mes commandes</Link>
}

export function FooterAccountLinks() {
  const { user } = useSessionUser()
  if (!user) return null
  return (
    <nav className="flex items-center gap-4 sm:gap-6 text-sm text-[#8B7355]">
      <Link href="/profile" className="hover:text-[#6B2D2D] transition-colors">Mon profil</Link>
      <Link href="/orders" className="hover:text-[#6B2D2D] transition-colors">Mes commandes</Link>
    </nav>
  )
}
