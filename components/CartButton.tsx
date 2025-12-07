"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CartButton() {
  const [count, setCount] = useState<number | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/cart-count', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      setCount(json.count)
    } catch {/* ignore */}
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('cart:changed', handler)
    return () => window.removeEventListener('cart:changed', handler)
  }, [])

  return (
    <Link href="/cart" className="relative inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground">
      Panier
      {count !== null && count > 0 && (
        <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  )
}
