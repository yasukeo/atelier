"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet'
import { MenuIcon, InstagramIcon, FacebookIcon, TikTokIcon } from '@/components/icons'

interface SessionUser { email?: string; role?: string }

interface Props {
  session: SessionUser | null
}

export function MobileNav({ session }: Props) {
  const [open, setOpen] = useState(false)
  const isAdmin = session?.role === 'ADMIN'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-[#8B7355] hover:text-[#6B2D2D] hover:bg-[#E9E7DB] transition-colors"
          aria-label="Menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] bg-[#F7F5F0] border-l border-[#D8D5C8] p-0">
        {/* Accessible title (visually hidden) */}
        <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E9E7DB]">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <Image src="/logos/icone (1).png" alt="Elwarcha" width={32} height={32} />
              <span className="text-base font-semibold text-[#6B2D2D]">Elwarcha</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            <SheetClose asChild>
              <Link href="/paintings" className="flex items-center px-3 py-3 rounded-lg text-sm font-medium text-[#2D2A26] hover:bg-[#E9E7DB] transition-colors">
                Galerie
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href="/about" className="flex items-center px-3 py-3 rounded-lg text-sm font-medium text-[#2D2A26] hover:bg-[#E9E7DB] transition-colors">
                À propos
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href="/contact" className="flex items-center px-3 py-3 rounded-lg text-sm font-medium text-[#2D2A26] hover:bg-[#E9E7DB] transition-colors">
                Contact
              </Link>
            </SheetClose>
            
            {session?.email && (
              <>
                <div className="my-4 border-t border-[#E9E7DB]" />
                <SheetClose asChild>
                  <Link href="/profile" className="flex items-center px-3 py-3 rounded-lg text-sm font-medium text-[#2D2A26] hover:bg-[#E9E7DB] transition-colors">
                    Mon profil
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/orders" className="flex items-center px-3 py-3 rounded-lg text-sm font-medium text-[#2D2A26] hover:bg-[#E9E7DB] transition-colors">
                    Mes commandes
                  </Link>
                </SheetClose>
                {isAdmin && (
                  <SheetClose asChild>
                    <Link href="/admin" className="flex items-center px-3 py-3 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors">
                      Administration
                    </Link>
                  </SheetClose>
                )}
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="border-t border-[#E9E7DB] p-4 space-y-4">
            {/* Social Links */}
            <div className="flex items-center justify-center gap-6">
              <a href="https://www.instagram.com/el.warcha/" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:text-[#6B2D2D] transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61581883214871" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:text-[#6B2D2D] transition-colors" aria-label="Facebook">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@elwarcha.com" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:text-[#6B2D2D] transition-colors" aria-label="TikTok">
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>

            {/* Auth Section */}
            {session?.email ? (
              <div className="space-y-3">
                <p className="text-xs text-[#8B7355] text-center truncate">{session.email}</p>
                <SheetClose asChild>
                  <Link
                    href="/api/auth/signout"
                    className="block w-full text-center px-4 py-2.5 rounded-full border border-[#D8D5C8] text-sm font-medium text-[#6B2D2D] hover:bg-[#E9E7DB] transition-colors"
                  >
                    Se déconnecter
                  </Link>
                </SheetClose>
              </div>
            ) : (
              <SheetClose asChild>
                <Link
                  href="/signin"
                  className="block w-full text-center px-4 py-2.5 rounded-full bg-[#6B2D2D] text-sm font-medium text-white hover:bg-[#5A2525] transition-colors"
                >
                  Se connecter
                </Link>
              </SheetClose>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
