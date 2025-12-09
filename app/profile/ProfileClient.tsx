'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#6B2D2D]">Mon profil</h1>
          <p className="text-sm text-[#8B7355] mt-1">Gérez vos informations personnelles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-[#D8D5C8] rounded-lg p-4 text-center">
            <p className="text-2xl font-semibold text-[#6B2D2D]">{user.ordersCount}</p>
            <p className="text-xs text-[#8B7355]">Commandes</p>
          </div>
          <div className="bg-white border border-[#D8D5C8] rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-[#6B2D2D]">{memberSince}</p>
            <p className="text-xs text-[#8B7355]">Membre depuis</p>
          </div>
        </div>

        {/* Profile Info */}
        <Card className="mb-6 border-[#D8D5C8] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-[#2D2A26]">Informations personnelles</CardTitle>
            <CardDescription className="text-[#8B7355]">Mettez à jour vos coordonnées</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Email</label>
                <Input 
                  type="email" 
                  value={user.email} 
                  disabled 
                  className="h-11 bg-[#F7F5F0] border-[#D8D5C8] text-[#8B7355]"
                />
                <p className="text-xs text-[#8B7355] mt-1">L'email ne peut pas être modifié</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Nom complet</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="h-11 border-[#D8D5C8] focus:border-[#6B2D2D] focus:ring-[#6B2D2D]"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isUpdating}
                className="w-full sm:w-auto h-11 bg-[#6B2D2D] hover:bg-[#5A2525] text-white"
              >
                {isUpdating ? 'Mise à jour...' : 'Enregistrer les modifications'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="mb-6 border-[#D8D5C8] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-[#2D2A26]">Changer le mot de passe</CardTitle>
            <CardDescription className="text-[#8B7355]">Sécurisez votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Mot de passe actuel</label>
                <Input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="h-11 border-[#D8D5C8] focus:border-[#6B2D2D] focus:ring-[#6B2D2D]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Nouveau mot de passe</label>
                <Input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 border-[#D8D5C8] focus:border-[#6B2D2D] focus:ring-[#6B2D2D]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Confirmer le nouveau mot de passe</label>
                <Input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 border-[#D8D5C8] focus:border-[#6B2D2D] focus:ring-[#6B2D2D]"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                variant="outline"
                className="w-full sm:w-auto h-11 border-[#D8D5C8] text-[#6B2D2D] hover:bg-[#E9E7DB]"
              >
                {isChangingPassword ? 'Modification...' : 'Changer le mot de passe'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            href="/orders"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-[#D8D5C8] bg-white text-sm font-medium text-[#6B2D2D] hover:bg-[#E9E7DB] transition-colors"
          >
            Voir mes commandes
          </Link>
          <Link 
            href="/paintings"
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#6B2D2D] text-sm font-medium text-white hover:bg-[#5A2525] transition-colors"
          >
            Continuer les achats
          </Link>
        </div>
      </div>
    </div>
  )
}
