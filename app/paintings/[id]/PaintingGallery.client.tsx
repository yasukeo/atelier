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
    return <div className="aspect-[4/5] bg-voile flex items-center justify-center text-sm text-pierre">Aucune image</div>
  }

  const blur = cloudinaryBlurUrl(current.url)
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full aspect-[4/5] overflow-hidden bg-voile cursor-zoom-in"
        aria-label="Agrandir l'image"
      >
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt || title}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 55vw"
          className="object-contain"
          {...(blur ? { placeholder: 'blur' as const, blurDataURL: blur } : {})}
        />
        <span className="absolute bottom-3 right-3 bg-chaux/90 px-2.5 py-1 text-[12px] text-encre opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
          Agrandir
        </span>
      </button>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Afficher l'image ${i + 1} sur ${images.length}`}
              aria-current={i === index}
              className={cn(
                'relative w-16 h-20 sm:w-20 sm:h-24 shrink-0 overflow-hidden bg-voile transition',
                i === index ? 'outline outline-1 outline-offset-2 outline-encre' : 'opacity-60 hover:opacity-100'
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
