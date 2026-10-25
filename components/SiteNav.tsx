"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/paintings', label: 'Galerie' },
  { href: '/about', label: "L'atelier" },
  { href: '/contact', label: 'Contact' },
]

// Desktop navigation: the current section is marked for sighted and screen-reader users alike
export function SiteNav() {
  const pathname = usePathname()
  const { data } = useSession()
  const links = data?.user ? [...LINKS, { href: '/orders', label: 'Mes commandes' }] : LINKS
  return (
    <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-8 text-[14px]">
      {links.map(l => {
        const active = pathname === l.href || pathname.startsWith(l.href + '/')
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative py-1 transition-colors',
              active ? 'text-encre' : 'text-encre/60 hover:text-encre',
              'after:absolute after:left-0 after:right-0 after:-bottom-[3px] after:h-px after:bg-grenat after:origin-left after:transition-transform',
              active ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
            )}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
