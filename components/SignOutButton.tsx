"use client"
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

type Props = { className?: string; label?: string }

export function SignOutButton({ className, label = 'Se déconnecter' }: Props) {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: '/' })}
      className={className}
      variant="outline"
      aria-label={label}
    >
      {label}
    </Button>
  )
}
