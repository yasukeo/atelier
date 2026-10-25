import Image from 'next/image'
import Link from 'next/link'
import type { Painting, Artist, PaintingImage } from '@prisma/client'
import { Khatam } from '@/components/Khatam'
import { cn } from '@/lib/utils'
import { cloudinaryBlurUrl, formatDimensions, formatMAD } from '@/lib/format'

interface PaintingWithRels extends Painting {
  artist: Artist
  images: PaintingImage[]
  technique?: { name: string } | null
  recreationOptions?: { priceMAD: number }[] // lets RECREATABLE cards show their lowest price
}

function blurProps(url: string) {
  const blur = cloudinaryBlurUrl(url)
  return blur ? { placeholder: 'blur' as const, blurDataURL: blur } : {}
}

/*
 * A painting presented like a museum label (cartel): title, artist and technique,
 * size and price. Paintings keep square corners, like the canvases themselves.
 * The second photo (usually the work in another room) fades in on hover.
 */
export default function PaintingCard({ painting, priority = false }: { painting: PaintingWithRels; priority?: boolean }) {
  const [first, second] = painting.images
  const href = `/paintings/${painting.id}`
  const isUnique = painting.kind === 'UNIQUE'
  const soldOut = painting.available === false
  const optionPrices = painting.recreationOptions?.map(o => o.priceMAD) ?? []
  const fromPrice = Math.min(painting.priceMAD, ...optionPrices)
  const hasSeveralPrices = !isUnique && optionPrices.some(p => p !== painting.priceMAD)
  const sizes = '(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw'

  return (
    <article className="group relative">
      <div className={cn('relative aspect-[4/5] overflow-hidden bg-voile', soldOut && 'grayscale-[60%]')}>
        {first ? (
          <>
            <Image
              src={first.url}
              alt={first.alt || painting.title}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
              {...blurProps(first.url)}
            />
            {second && (
              <Image
                src={second.url}
                alt=""
                fill
                sizes={sizes}
                className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-pierre">Aucune image</div>
        )}
        {soldOut && (
          <span className="absolute left-0 top-0 bg-encre px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-chaux">
            {isUnique ? 'Vendue' : 'Indisponible'}
          </span>
        )}
      </div>

      <div className="pt-4 space-y-1">
        <h3 className="font-display text-[19px] leading-snug text-encre">
          {/* Stretched link: the whole card is clickable, but it is a single link for assistive tech */}
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-grenat focus-visible:after:outline-offset-4">
            {painting.title}
          </Link>
        </h3>
        <p className="text-[13px] text-pierre truncate">
          {painting.artist?.name}
          {painting.technique?.name && <span className="capitalize"> · {painting.technique.name}</span>}
        </p>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 pt-1.5 text-[14px]">
          <span className="tabular text-pierre whitespace-nowrap">{formatDimensions(painting.widthCm, painting.heightCm)}</span>
          <span className="tabular font-medium text-encre whitespace-nowrap">
            {hasSeveralPrices && <span className="font-normal text-pierre">dès </span>}
            {formatMAD(hasSeveralPrices ? fromPrice : painting.priceMAD)}
          </span>
        </div>
        <p className="flex items-center gap-1.5 pt-1 text-[12px] text-encre/75">
          {isUnique ? (
            <><Khatam className="size-3.5 text-grenat" /> Pièce unique</>
          ) : (
            <><span aria-hidden="true" className="size-3.5 inline-flex items-center justify-center text-grenat">↻</span> Re-création sur commande</>
          )}
        </p>
      </div>
    </article>
  )
}
