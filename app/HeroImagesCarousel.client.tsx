"use client"
import { useEffect, useRef, useState } from 'react'
import type { Painting, Artist, PaintingImage } from '@prisma/client'

interface PaintingWithRels extends Painting { artist: Artist; images: PaintingImage[] }
interface Props { paintings: PaintingWithRels[] }

// Simple fade carousel cycling through first N paintings' first image
export function HeroImagesCarousel({ paintings }: Props) {
  const imgs = paintings.slice(0, 6).map(p => ({ id: p.id, title: p.title, img: p.images[0] }))
  const [index, setIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const DURATION = 5000 // was 3500ms; slowed to 5s per request

  useEffect(() => {
    if (imgs.length <= 1) return
    intervalRef.current = setInterval(() => {
      setIndex(i => (i + 1) % imgs.length)
    }, DURATION)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [imgs.length])

  if (imgs.length === 0) {
    return (
      <div className="flex-1 grid grid-cols-3 gap-3 max-w-lg self-start lg:self-stretch">
        <div className="col-span-3 text-xs text-muted-foreground text-center mt-1">—</div>
      </div>
    )
  }

  // Show three logical slots; center one is active, others previous/next for subtle stagger
  const visible = [index, (index + 1) % imgs.length, (index + 2) % imgs.length]

  return (
    <div className="flex-1 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto lg:mx-0 mt-4 lg:mt-0">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 relative">
        {visible.map((vid, slot) => {
          const item = imgs[vid]
          const img = item.img
          return (
            <div
              key={item.id + '-' + slot}
              className="relative aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden shadow ring-1 ring-black/5 bg-muted"
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.url}
                  alt={img.alt || item.title}
                  className="absolute inset-0 w-full h-full object-cover animate-fade"
                  style={{ animationDelay: `${slot * 150}ms` }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">—</div>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-[#8B7355] text-center mt-3">Aperçu de nos œuvres</p>
      <style jsx>{`
        @keyframes fadeInHeroImg { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
        .animate-fade { animation: fadeInHeroImg 0.9s ease both; }
      `}</style>
    </div>
  )
}
export default HeroImagesCarousel
