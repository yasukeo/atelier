"use client"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SignOutButton } from '@/components/SignOutButton'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface SessionUser { email?: string; role?: string }

interface Props {
  session: SessionUser | null
  variant?: 'hero' | 'bar'
  showRegister?: boolean
  className?: string
}

export function AuthActions({ session, variant = 'bar', showRegister = true, className }: Props) {
  const params = useSearchParams()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  // If coming from a CTA specifying register
  useEffect(() => {
    if (params.get('tab') === 'register') setActiveTab('register')
  }, [params])

  const isAdmin = session?.role === 'ADMIN'

  if (!session) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Link
          href={activeTab === 'register' ? '/signin?tab=register' : '/signin'}
          className={cn(
            'inline-flex items-center justify-center rounded-full h-9 px-4 text-xs font-medium transition shadow-sm',
            variant === 'hero'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {activeTab === 'register' ? 'Créer un compte' : 'Se connecter'}
        </Link>
        {showRegister && activeTab !== 'register' && (
            <button
              onClick={() => setActiveTab('register')}
              className={cn('text-xs underline text-muted-foreground hover:text-foreground hidden sm:inline-flex')}
            >Créer un compte</button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {isAdmin && (
        <Link href="/admin" className={cn('text-xs font-medium rounded-full h-9 px-4 inline-flex items-center justify-center border border-amber-300/60 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition', variant === 'hero' ? '' : 'order-2')}>Admin</Link>
      )}
      <Link 
        href="/profile" 
        className="text-xs text-[#8B7355] hover:text-[#6B2D2D] hidden md:inline-block transition-colors"
        title="Mon profil"
      >
        {session.email?.split('@')[0]}
      </Link>
      <SignOutButton
        label="Se déconnecter"
        className={cn(
          'h-9 px-4 text-xs rounded-full',
          variant === 'hero'
            ? 'bg-white/90 dark:bg-zinc-900/70 border border-zinc-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 shadow-sm'
            : 'border border-zinc-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-800'
        )}
      />
    </div>
  )
}
