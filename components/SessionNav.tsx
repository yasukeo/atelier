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
          // Reserve the space of the sign-in link to avoid a layout shift
          <div className="h-9 w-24" aria-hidden="true" />
        ) : (
          <Suspense>
            <AuthActions session={user} />
          </Suspense>
        )}
      </div>
      <MobileNav session={user} />
    </>
  )
}

export function FooterAccountLinks() {
  const { user } = useSessionUser()
  if (!user) return null
  return (
    <ul className="space-y-2 pt-3 border-t border-sable/15">
      <li><Link href="/profile" className="hover:text-white transition-colors">Mon profil</Link></li>
      <li><Link href="/orders" className="hover:text-white transition-colors">Mes commandes</Link></li>
    </ul>
  )
}
