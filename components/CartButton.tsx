"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CartButton() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    const load = () => {
      fetch('/api/cart-count', { cache: 'no-store' })
        .then(res => (res.ok ? res.json() : null))
        .then(json => { if (active && json) setCount(json.count) })
        .catch(() => {/* ignore */})
    }
    load()
    window.addEventListener('cart:changed', load)
    return () => {
      active = false
      window.removeEventListener('cart:changed', load)
    }
  }, [])

  const filled = count !== null && count > 0
  return (
    <Link
      href="/cart"
      aria-label={filled ? `Panier, ${count} article${count > 1 ? 's' : ''}` : 'Panier'}
      className="inline-flex items-center gap-2 text-[14px] text-encre/70 hover:text-encre transition-colors"
    >
      <span>Panier</span>
      <span
        aria-hidden="true"
        className={
          filled
            ? 'inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-grenat px-1.5 text-[11px] font-semibold text-white tabular'
            : 'inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-trait px-1.5 text-[11px] text-pierre tabular'
        }
      >
        {count ?? 0}
      </span>
    </Link>
  )
}
