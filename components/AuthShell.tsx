import { cn } from '@/lib/utils'

/* Two-column frame shared by the sign-in, forgot-password and reset-password pages */
export function AuthShell({ title, intro, children }: { title: string; intro?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid lg:grid-cols-[5fr_6fr] min-h-[calc(100vh-4rem)]">
      <aside className="hidden lg:flex flex-col justify-between bg-nuit text-sable px-14 py-16">
        <p lang="ar" dir="rtl" className="font-arabic font-bold text-[9rem] leading-none text-left">الورشة</p>
        <p className="font-display text-3xl leading-snug text-chaux max-w-sm">
          Votre compte suit chaque commande, de la réservation à la livraison.
        </p>
      </aside>
      <div className="flex items-start lg:items-center justify-center px-5 py-14 sm:px-10">
        <div className="w-full max-w-md">
          <h1 className="font-display text-5xl leading-none text-encre">{title}</h1>
          {intro && <p className="mt-4 text-[15px] leading-relaxed text-pierre">{intro}</p>}
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </div>
  )
}

/* Inline status message: errors are announced to screen readers */
export function Notice({ tone, children, className }: { tone: 'error' | 'success'; children: React.ReactNode; className?: string }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'border-l-2 px-4 py-3 text-sm leading-relaxed text-encre',
        tone === 'error' ? 'border-destructive bg-destructive/5' : 'border-emerald-700 bg-emerald-700/5',
        className
      )}
    >
      {children}
    </p>
  )
}
