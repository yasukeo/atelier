"use client"
import { useState } from 'react'
import Image from 'next/image'
import { Lightbox, type LightboxImage } from '@/components/Lightbox'
import { cn } from '@/lib/utils'
import { cloudinaryBlurUrl } from '@/lib/format'

export function PaintingGallery({ images, title }: { images: LightboxImage[]; title: string }) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const current = images[index]

  if (!current) {
    return <div className="aspect-[4/5] rounded-xl bg-[#EAE8DE] flex items-center justify-center text-sm text-[#8B7355]">Aucune image</div>
  }

  const blur = cloudinaryBlurUrl(current.url)
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative block w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#EAE8DE] cursor-zoom-in ring-1 ring-black/5"
        aria-label="Agrandir l'image"
      >
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt || title}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-contain"
          {...(blur ? { placeholder: 'blur' as const, blurDataURL: blur } : {})}
        />
      </button>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Afficher l'image ${i + 1}`}
              aria-current={i === index}
              className={cn(
                'relative w-16 h-20 sm:w-20 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-[#EAE8DE] transition',
                i === index ? 'ring-2 ring-[#6B2D2D]' : 'opacity-70 hover:opacity-100'
              )}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      {open && <Lightbox images={images} startIndex={index} caption={title} onClose={() => setOpen(false)} />}
    </div>
  )
}
