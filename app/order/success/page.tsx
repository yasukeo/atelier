import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

function formatMAD(v: number) { return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v) }

export default async function OrderSuccessPage({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const id = searchParams.id
  if (!id) notFound()
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) notFound()
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
  if (!user) notFound()
  const order = await prisma.order.findFirst({ where: { id, customerId: user.id }, include: { items: { include: { painting: true } }, discountCode: true } })
  if (!order) notFound()

  const discountPercent = order.discountCode?.percent ?? undefined
  const discountAmount = discountPercent ? Math.floor((order.totalMAD + (order.discountCode ? Math.floor((order.totalMAD * discountPercent) / (100 - discountPercent)) : 0) - order.totalMAD)) : 0 // fallback simple

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#6B2D2D] mb-2">Commande réussie</h1>
          <p className="text-sm sm:text-base text-[#8B7355]">
            Merci pour votre achat !
          </p>
          <p className="text-xs text-[#8B7355] mt-1">
            Référence: <span className="font-mono bg-[#E9E7DB] px-2 py-0.5 rounded">{order.id}</span>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-[#D8D5C8] rounded-lg shadow-sm overflow-hidden">
          {/* Articles */}
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-medium text-[#2D2A26] mb-4">Articles</h2>
            <div className="space-y-3">
              {order.items.map(it => (
                <div key={it.id} className="flex justify-between items-start gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-[#2D2A26] font-medium truncate">{it.painting.title}</p>
                    <p className="text-xs text-[#8B7355]">
                      {it.widthCm && it.heightCm ? `${it.widthCm}×${it.heightCm}cm · ` : ''}
                      Qté: {it.quantity}
                    </p>
                  </div>
                  <span className="text-[#6B2D2D] font-medium shrink-0">{formatMAD(it.unitPriceMAD * it.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-[#E9E7DB] bg-[#FDFCFA] p-4 sm:p-6 space-y-2">
            <div className="flex justify-between text-sm text-[#8B7355]">
              <span>Sous-total</span>
              <span>{formatMAD(order.items.reduce((s,i)=> s + i.unitPriceMAD * i.quantity,0))}</span>
            </div>
            {discountPercent && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Réduction ({discountPercent}%)</span>
                <span>-{formatMAD(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-[#8B7355]">
              <span>Livraison</span>
              <span className="text-green-600">Gratuite</span>
            </div>
            <div className="flex justify-between font-semibold text-[#2D2A26] border-t border-[#D8D5C8] pt-3 mt-3">
              <span>Total payé</span>
              <span className="text-lg text-[#6B2D2D]">{formatMAD(order.totalMAD)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a 
            href="/orders" 
            className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-[#D8D5C8] bg-white text-sm font-medium text-[#6B2D2D] hover:bg-[#E9E7DB] transition-colors"
          >
            Voir mes commandes
          </a>
          <a 
            href="/paintings" 
            className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-[#6B2D2D] text-sm font-medium text-white hover:bg-[#5A2525] transition-colors"
          >
            Continuer les achats
          </a>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-[#E9E7DB] rounded-lg text-center">
          <p className="text-sm text-[#8B7355]">
            📧 Un email de confirmation a été envoyé à votre adresse.
          </p>
          <p className="text-xs text-[#8B7355] mt-1">
            Vous recevrez des mises à jour sur le statut de votre commande.
          </p>
        </div>
      </div>
    </div>
  )
}
