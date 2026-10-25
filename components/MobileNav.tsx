"use client"

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet'
import { MenuIcon, InstagramIcon, FacebookIcon, TikTokIcon } from '@/components/icons'

interface SessionUser { email?: string; role?: string }

interface Props {
  session: SessionUser | null
}

const SOCIALS = [
  { href: 'https://www.instagram.com/el.warcha/', label: 'Instagram', Icon: InstagramIcon },
  { href: 'https://www.facebook.com/profile.php?id=61581883214871', label: 'Facebook', Icon: FacebookIcon },
  { href: 'https://www.tiktok.com/@elwarcha.com', label: 'TikTok', Icon: TikTokIcon },
]

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <SheetClose asChild>
      <Link href={href} className="block py-3 font-display text-[28px] leading-tight text-sable hover:text-white transition-colors">
        {children}
      </Link>
    </SheetClose>
  )
}

export function MobileNav({ session }: Props) {
  const [open, setOpen] = useState(false)
  const isAdmin = session?.role === 'ADMIN'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden -mr-2 inline-flex items-center justify-center p-2 text-encre/80 hover:text-encre"
          aria-label="Ouvrir le menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[86vw] max-w-sm bg-nuit text-sable border-l-0 p-0">
        <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
        <div className="flex flex-col h-full px-7 pt-14 pb-8">
          <p lang="ar" dir="rtl" className="font-arabic text-5xl leading-none text-sable/90 text-left mb-8">الورشة</p>

          <nav aria-label="Menu" className="flex-1">
            <MenuLink href="/paintings">Galerie</MenuLink>
            <MenuLink href="/about">L&apos;atelier</MenuLink>
            <MenuLink href="/contact">Contact</MenuLink>
            {session?.email && (
              <div className="mt-6 pt-6 border-t border-sable/15 text-[15px] space-y-1">
                <SheetClose asChild><Link href="/orders" className="block py-2 hover:text-white">Mes commandes</Link></SheetClose>
                <SheetClose asChild><Link href="/profile" className="block py-2 hover:text-white">Mon profil</Link></SheetClose>
                {isAdmin && (
                  <SheetClose asChild><Link href="/admin" className="block py-2 text-safran hover:text-white">Administration</Link></SheetClose>
                )}
              </div>
            )}
          </nav>

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-sable/70 hover:text-white transition-colors" aria-label={label}>
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            {session?.email ? (
              <div className="space-y-3">
                <p className="text-xs text-sable/70 truncate">{session.email}</p>
                <button
                  type="button"
                  onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }) }}
                  className="btn w-full border border-sable/40 text-sable hover:bg-sable hover:text-nuit"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                <SheetClose asChild>
                  <Link href="/signin" className="btn-clair w-full">Se connecter</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/signin?tab=register" className="btn w-full border border-sable/40 text-sable hover:bg-sable hover:text-nuit">Créer un compte</Link>
                </SheetClose>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
