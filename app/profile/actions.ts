'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function updateProfile(data: { name: string }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return { ok: false, error: 'Non authentifié' }
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name || null,
      }
    })

    return { ok: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { ok: false, error: 'Erreur lors de la mise à jour' }
  }
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return { ok: false, error: 'Non authentifié' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, passwordHash: true }
    })

    if (!user || !user.passwordHash) {
      return { ok: false, error: 'Utilisateur non trouvé' }
    }

    // Verify current password
    const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash)
    if (!isValid) {
      return { ok: false, error: 'Mot de passe actuel incorrect' }
    }

    // Hash new password
    const newHash = await bcrypt.hash(data.newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    })

    return { ok: true }
  } catch (error) {
    console.error('Error changing password:', error)
    return { ok: false, error: 'Erreur lors du changement de mot de passe' }
  }
}
