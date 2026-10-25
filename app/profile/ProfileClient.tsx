'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { updateProfile, changePassword } from './actions'
import Link from 'next/link'

interface ProfileClientProps {
  user: {
    email: string
    name: string | null
    createdAt: string
    ordersCount: number
  }
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [name, setName] = useState(user.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [isUpdating, startUpdating] = useTransition()
  const [isChangingPassword, startChangingPassword] = useTransition()

  const memberSince = new Date(user.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    startUpdating(async () => {
      const result = await updateProfile({ name })
      if (result.ok) {
        toast.success('Profil mis à jour')
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour')
      }
    })
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    startChangingPassword(async () => {
      const result = await changePassword({ currentPassword, newPassword })
      if (result.ok) {
        toast.success('Mot de passe modifié avec succès')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(result.error || 'Erreur lors du changement de mot de passe')
      }
    })
  }

  const label = 'block text-[13px] font-medium text-encre mb-2'

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
      <h1 className="font-display text-5xl sm:text-6xl leading-none text-encre">Mon profil</h1>
      <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4 text-[15px]">
        <div><dt className="eyebrow">Commandes</dt><dd className="mt-1 font-display text-3xl tabular"><Link href="/orders" className="hover:text-grenat">{user.ordersCount}</Link></dd></div>
        <div><dt className="eyebrow">Membre depuis</dt><dd className="mt-1 font-display text-3xl">{memberSince}</dd></div>
      </dl>

      <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-16">
        <section aria-labelledby="infos" className="border-t-2 border-encre pt-6">
          <h2 id="infos" className="font-display text-2xl text-encre">Informations</h2>
          <form onSubmit={handleUpdateProfile} className="mt-6 space-y-6">
            <div>
              <label htmlFor="profile-email" className={label}>Email</label>
              <Input id="profile-email" type="email" value={user.email} disabled aria-describedby="profile-email-hint" className="bg-voile text-pierre" />
              <p id="profile-email-hint" className="mt-1.5 text-[13px] text-pierre">L&apos;email du compte ne peut pas être modifié.</p>
            </div>
            <div>
              <label htmlFor="profile-name" className={label}>Nom complet</label>
              <Input id="profile-name" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <button type="submit" disabled={isUpdating} className="btn-primaire">
              {isUpdating ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        </section>

        <section aria-labelledby="mdp" className="border-t-2 border-encre pt-6">
          <h2 id="mdp" className="font-display text-2xl text-encre">Mot de passe</h2>
          <form onSubmit={handleChangePassword} className="mt-6 space-y-6">
            <div>
              <label htmlFor="current-password" className={label}>Mot de passe actuel</label>
              <Input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="new-password" className={label}>Nouveau mot de passe <span className="font-normal text-pierre">(6 caractères minimum)</span></label>
              <Input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} maxLength={100} />
            </div>
            <div>
              <label htmlFor="confirm-password" className={label}>Confirmer le nouveau mot de passe</label>
              <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} maxLength={100} />
            </div>
            <button type="submit" disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword} className="btn-secondaire">
              {isChangingPassword ? 'Modification…' : 'Changer le mot de passe'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
