import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { markRead } from './actions'
import { DeleteMessageButton } from '../DeleteMessageButton.client'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import React from 'react'

export const dynamic = 'force-dynamic'

export default async function AdminMessageDetail({ params }: { params: { id: string } }) {
  const message = await prisma.contactMessage.findUnique({ where: { id: params.id } })
  if (!message) return notFound()

  if (!message.readAt) {
    // Fire and forget mark as read (can't call action directly in server component without await side effects)
    markRead(message.id)
  }

  return (
    <div className="p-6 space-y-4">
      <Link href="/admin/messages" className="text-sm underline">← Retour</Link>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold break-words flex-1">{message.subject}</h1>
  <DeleteMessageButton id={message.id} />
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        <div>De: {message.name} &lt;{message.email}&gt; {message.phone ? ` · ${message.phone}` : ''}</div>
        <div>Reçu: {format(message.createdAt, 'PPP p', { locale: fr })}</div>
        {message.readAt && <div>Lu: {format(message.readAt, 'PPP p', { locale: fr })}</div>}
      </div>
      <hr />
      <div className="prose max-w-none whitespace-pre-wrap break-words text-sm">{message.message}</div>
    </div>
  )
}

