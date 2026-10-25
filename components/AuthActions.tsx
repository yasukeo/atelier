"use client"
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface SessionUser { email?: string; role?: string }

interface Props {
  session: SessionUser | null
  className?: string
}

// Header account area (desktop). Mobile uses <MobileNav>.
export function AuthActions({ session, className }: Props) {
  if (!session) {
    return (
      <div className={cn('flex items-center gap-4 text-[14px]', className)}>
        <Link href="/signin" className="text-encre/70 hover:text-encre transition-colors">Se connecter</Link>
        <Link href="/signin?tab=register" className="btn-secondaire h-9 px-4 text-[13px]">Créer un compte</Link>
      </div>
    )
  }

  const isAdmin = session.role === 'ADMIN'
  return (
    <div className={cn('flex items-center gap-4 text-[14px]', className)}>
      {isAdmin && (
        <Link href="/admin" className="text-[12px] font-medium uppercase tracking-[0.12em] text-grenat hover:text-grenat-fonce">Admin</Link>
      )}
      <Link href="/profile" className="text-encre/70 hover:text-encre transition-colors max-w-[10rem] truncate" title="Mon profil">
        {session.email?.split('@')[0]}
      </Link>
      <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="text-encre/60 hover:text-encre transition-colors">
        Se déconnecter
      </button>
    </div>
  )
}
