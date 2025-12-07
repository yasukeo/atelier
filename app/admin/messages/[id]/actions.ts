"use server"
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteMessage(id: string) {
  await prisma.contactMessage.delete({ where: { id } })
  revalidatePath('/admin/messages')
  redirect('/admin/messages')
}

export async function markRead(id: string) {
  await prisma.contactMessage.update({ where: { id }, data: { readAt: new Date() } })
  revalidatePath(`/admin/messages/${id}`)
  revalidatePath('/admin/messages')
}
