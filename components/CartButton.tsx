"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShoppingCartIcon } from './icons'

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

  return (
    <Link href="/cart" className="relative inline-flex items-center gap-1.5 text-xs font-medium text-[#8B7355] hover:text-[#6B2D2D] transition-colors mr-2">
      <ShoppingCartIcon className="w-5 h-5" />
      <span className="hidden sm:inline">Panier</span>
      {count !== null && count > 0 && (
        <span className="absolute -top-2 -right-4 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6B2D2D] px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  )
}
