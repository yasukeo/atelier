import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { DeleteMessageButton } from '../DeleteMessageButton.client'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import React from 'react'

export const dynamic = 'force-dynamic'

export default async function AdminMessageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const message = await prisma.contactMessage.findUnique({ where: { id } })
  if (!message) return notFound()

  if (!message.readAt) {
    // Mark as read directly (no revalidatePath needed — page is force-dynamic)
    await prisma.contactMessage.update({ where: { id }, data: { readAt: new Date() } })
    message.readAt = new Date()
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

