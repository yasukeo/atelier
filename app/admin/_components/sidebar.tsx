"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Images, Users, Palette, Brush, ShoppingCart, LogOut, Percent, Mail } from 'lucide-react'
import { SignOutButton } from '@/components/SignOutButton'
import { useState } from 'react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/paintings', label: 'Paintings', icon: Images },
  { href: '/admin/artists', label: 'Artists', icon: Users },
  { href: '/admin/styles', label: 'Styles', icon: Palette },
  { href: '/admin/techniques', label: 'Techniques', icon: Brush },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/discounts', label: 'Discounts', icon: Percent },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="md:hidden fixed top-3 left-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background shadow-sm"
        aria-label="Toggle navigation"
      >
        <span className="sr-only">Menu</span>
        <div className="flex flex-col gap-1">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </div>
      </button>
      <aside
        className={cn(
          "fixed md:static z-30 inset-y-0 left-0 w-60 shrink-0 border-r bg-gradient-to-b from-background to-background/80 backdrop-blur-md flex flex-col shadow-lg md:shadow-none transition-transform md:translate-x-0",
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="h-14 flex items-center px-5 border-b font-semibold tracking-tight text-sm">
          Atelier Admin
        </div>
        <nav className="flex-1 overflow-auto px-3 py-4 space-y-1">
          {NAV.map(item => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className={cn("h-4 w-4", active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto border-t p-3 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Session</span>
          <div className="flex items-center gap-2">
            <LogOut className="h-3 w-3 text-muted-foreground" />
            <SignOutButton className="text-xs px-2 py-1 h-auto border border-border hover:bg-muted rounded" />
          </div>
        </div>
      </aside>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden"
          aria-hidden="true"
        />
      )}
    </>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <Sidebar />
      <div className="md:pl-0 flex flex-col min-h-screen">
        <header className="hidden md:flex h-14 items-center border-b px-6 justify-between bg-background/60 backdrop-blur-md">
          <div className="text-sm text-muted-foreground">Tableau de bord</div>
        </header>
        <main className="flex-1 p-6 space-y-8 bg-gradient-to-b from-background via-background to-background/95">
          <div className="mx-auto w-full max-w-screen-xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
