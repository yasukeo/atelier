"use server"
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'

export async function deleteMessage(id: string) {
  // Server actions are reachable by anyone who knows their ID: the /admin middleware doesn't protect them
  await requireAdmin()
  if (typeof id !== 'string' || !id) return
  await prisma.contactMessage.deleteMany({ where: { id } })
  revalidatePath('/admin/messages')
  redirect('/admin/messages')
}
