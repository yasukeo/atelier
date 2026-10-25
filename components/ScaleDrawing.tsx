/*
 * Elevation drawing (in centimetres) of a painting hung above a 2 m sofa,
 * so buyers can judge a size like "62 × 80 cm" before ordering.
 */
const SOFA_W = 200
const SOFA_H = 85
const GAP = 22 // between the sofa back and the bottom of the frame
const MARGIN = 26

export function ScaleDrawing({ widthCm, heightCm, className }: { widthCm: number; heightCm: number; className?: string }) {
  const w = Math.max(10, widthCm)
  const h = Math.max(10, heightCm)
  const viewW = Math.max(SOFA_W, w) + MARGIN * 2 + 30
  const viewH = SOFA_H + GAP + h + MARGIN * 2
  const floorY = viewH - MARGIN
  const cx = viewW / 2 - 12
  const sofaX = cx - SOFA_W / 2
  const sofaTop = floorY - SOFA_H
  const px = cx - w / 2
  const py = sofaTop - GAP - h
  // Label size stays readable whatever the painting size
  const fs = Math.max(9, viewW / 34)

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full h-auto max-h-80"
        role="img"
        aria-label={`Tableau de ${widthCm} × ${heightCm} cm accroché au-dessus d'un canapé de 2 mètres`}
      >
        {/* floor */}
        <line x1={MARGIN / 2} x2={viewW - MARGIN / 2} y1={floorY} y2={floorY} stroke="var(--color-encre)" strokeWidth={0.8} />
        {/* sofa: back, seat, arms, feet */}
        <g fill="none" stroke="var(--color-pierre)" strokeWidth={0.8} strokeLinejoin="round">
          <rect x={sofaX + 12} y={sofaTop} width={SOFA_W - 24} height={SOFA_H - 22} rx={6} />
          <rect x={sofaX} y={sofaTop + 28} width={18} height={SOFA_H - 40} rx={5} />
          <rect x={sofaX + SOFA_W - 18} y={sofaTop + 28} width={18} height={SOFA_H - 40} rx={5} />
          <rect x={sofaX + 10} y={floorY - 34} width={SOFA_W - 20} height={22} rx={4} />
          <line x1={sofaX + 16} x2={sofaX + 16} y1={floorY - 12} y2={floorY} />
          <line x1={sofaX + SOFA_W - 16} x2={sofaX + SOFA_W - 16} y1={floorY - 12} y2={floorY} />
        </g>
        {/* the painting */}
        <rect x={px} y={py} width={w} height={h} fill="var(--color-grenat)" fillOpacity={0.12} stroke="var(--color-grenat)" strokeWidth={1.2} />
        {/* width dimension line */}
        <g stroke="var(--color-encre)" strokeWidth={0.6}>
          <line x1={px} x2={px + w} y1={py - 9} y2={py - 9} />
          <line x1={px} x2={px} y1={py - 13} y2={py - 5} />
          <line x1={px + w} x2={px + w} y1={py - 13} y2={py - 5} />
          {/* height dimension line */}
          <line x1={px + w + 9} x2={px + w + 9} y1={py} y2={py + h} />
          <line x1={px + w + 5} x2={px + w + 13} y1={py} y2={py} />
          <line x1={px + w + 5} x2={px + w + 13} y1={py + h} y2={py + h} />
        </g>
        <g fill="var(--color-encre)" fontSize={fs} fontFamily="var(--font-hanken), sans-serif">
          <text x={px + w / 2} y={py - 13} textAnchor="middle">{widthCm} cm</text>
          <text x={px + w + 16} y={py + h / 2} dominantBaseline="middle">{heightCm} cm</text>
          <text x={cx} y={floorY - 44} textAnchor="middle" fill="var(--color-pierre)">canapé 2 m</text>
        </g>
      </svg>
      <figcaption className="mt-2 text-[12px] text-pierre">À l&apos;échelle, au-dessus d&apos;un canapé de 2 m.</figcaption>
    </figure>
  )
}
