import { prisma } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { DeleteMessageButton } from './DeleteMessageButton.client'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

async function getMessagesPage(page: number) {
  const skip = (page - 1) * PAGE_SIZE
  const [rows, total] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip,
      take: PAGE_SIZE,
    }),
    prisma.contactMessage.count(),
  ])
  return { rows, total }
}

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams
  const page = Math.max(1, Number(resolvedParams.page) || 1)
  const { rows: messages, total } = await getMessagesPage(page)
  const pageCount = Math.ceil(total / PAGE_SIZE) || 1
  const hasPrev = page > 1
  const hasNext = page < pageCount

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Messages</h1>
      <div className="border rounded-md divide-y">
  {messages.length === 0 && <p className="p-4 text-sm text-muted-foreground">Aucun message.</p>}
  {messages.map(m => (
          <div key={m.id} className="flex flex-col gap-1 p-4 hover:bg-muted/50 transition group">
            <div className="flex items-center justify-between gap-4">
              <Link href={`/admin/messages/${m.id}`} className="font-medium truncate max-w-[60%] group-hover:underline">
                {m.subject}
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(m.createdAt), { addSuffix: true, locale: fr })}</span>
                <DeleteMessageButton id={m.id} small />
              </div>
            </div>
            <div className="text-xs text-muted-foreground truncate">De: {m.name} &lt;{m.email}&gt; {m.phone ? ` · ${m.phone}` : ''}</div>
            <div className="text-sm line-clamp-2 text-muted-foreground">{m.message}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-muted-foreground">Page {page} / {pageCount}{total === 0 ? '' : ` • ${total} message${total>1?'s':''}`}</div>
        <div className="flex gap-2">
          {hasPrev && (
            <Link className="text-sm underline" href={`/admin/messages?page=${page-1}`}>Précédent</Link>
          )}
          {hasNext && (
            <Link className="text-sm underline" href={`/admin/messages?page=${page+1}`}>Suivant</Link>
          )}
        </div>
      </div>
    </div>
  )
}

