"use client"
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface LightboxImage { id: string; url: string; alt: string | null }

/* ─── Fullscreen image overlay (Esc to close, ←/→ to navigate) ─── */
export function Lightbox({ images, startIndex, caption, onClose }: {
  images: LightboxImage[]
  startIndex: number
  caption: string
  onClose: () => void
}) {
  const [idx, setIdx] = useState(startIndex)
  const total = images.length
  const go = useCallback((dir: number) => setIdx(i => (i + dir + total) % total), [total])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, go])

  const current = images[idx]
  if (!current) return null

  return (
    <div className="fixed inset-0 z-[100] bg-nuit/95 flex items-center justify-center" onClick={onClose} role="dialog" aria-modal="true" aria-label={caption}>
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] m-4 flex items-center justify-center" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          autoFocus
          className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition"
          aria-label="Fermer"
        >
          ✕
        </button>

        <div className="relative w-full h-full">
          <Image
            src={current.url}
            alt={current.alt || caption}
            fill
            sizes="90vw"
            className="object-contain"
            priority
          />
        </div>

        {total > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl transition"
              aria-label="Précédent"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl transition"
              aria-label="Suivant"
            >
              ›
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setIdx(i)}
                  className={cn("h-2.5 w-2.5 rounded-full border border-white/60 transition", i === idx ? 'bg-white' : 'bg-white/30 hover:bg-white/60')}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
          <p className="text-white/80 text-sm font-medium drop-shadow">{caption}</p>
        </div>
      </div>
    </div>
  )
}
