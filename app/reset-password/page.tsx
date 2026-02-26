"use client"
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { resetPassword } from './actions'
import { useTransition, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordContent /></Suspense>
}

function ResetPasswordContent() {
  const params = useSearchParams()
  const token = params.get('token')
  const error = params.get('error')
  const [pending, startTransition] = useTransition()

  const errorMessages: Record<string, string> = {
    'invalid-token': 'Ce lien de réinitialisation est invalide.',
    'expired': 'Ce lien a expiré. Veuillez demander un nouveau lien.',
    'used': 'Ce lien a déjà été utilisé.',
    'mismatch': 'Les mots de passe ne correspondent pas.',
  }

  const displayError = error ? (errorMessages[error] || error) : null

  // No token provided
  if (!token && !error) {
    return (
      <div className="min-h-screen bg-[#E9E7DB] flex items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-md">
          <div className="bg-[#E9E7DB] border border-[#D8D5C8] rounded-xl shadow-lg p-8 text-center">
            <Image src="/logos/Plan de travail 11.png" alt="Elwarcha" width={100} height={75} className="mx-auto mb-6" />
            <h1 className="text-xl font-semibold text-[#6B2D2D] mb-4">Lien invalide</h1>
            <p className="text-[#8B7355] mb-6">
              Ce lien de réinitialisation est invalide ou a expiré.
            </p>
            <Link href="/forgot-password" className="text-[#6B2D2D] underline underline-offset-4">
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Token expired or invalid error (no form)
  if (error === 'invalid-token' || error === 'expired' || error === 'used') {
    return (
      <div className="min-h-screen bg-[#E9E7DB] flex items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-md">
          <div className="bg-[#E9E7DB] border border-[#D8D5C8] rounded-xl shadow-lg p-8 text-center">
            <Image src="/logos/Plan de travail 11.png" alt="Elwarcha" width={100} height={75} className="mx-auto mb-6" />
            <h1 className="text-xl font-semibold text-[#6B2D2D] mb-4">Lien invalide</h1>
            <p className="text-[#8B7355] mb-6">{displayError}</p>
            <Link href="/forgot-password" className="text-[#6B2D2D] underline underline-offset-4">
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await resetPassword(formData)
    })
  }

  return (
    <div className="min-h-screen bg-[#E9E7DB] flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md">
        <div className="bg-[#E9E7DB] border border-[#D8D5C8] rounded-xl shadow-lg p-8">
          <div className="mb-6 text-center">
            <Image src="/logos/Plan de travail 11.png" alt="Elwarcha" width={100} height={75} className="mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-[#6B2D2D]">Nouveau mot de passe</h1>
            <p className="text-sm text-[#8B7355] mt-2">
              Entrez votre nouveau mot de passe ci-dessous.
            </p>
          </div>

          {displayError && (
            <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="token" value={token || ''} />
            
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-medium text-[#2D2A26]">
                Nouveau mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Minimum 6 caractères"
                className="bg-[#FDFCFA] border-[#DCD9CC]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-xs font-medium text-[#2D2A26]">
                Confirmer le mot de passe
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Répétez le mot de passe"
                className="bg-[#FDFCFA] border-[#DCD9CC]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#6B2D2D] hover:bg-[#5A2525]" 
              disabled={pending}
            >
              {pending ? 'Modification...' : 'Changer le mot de passe'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[#8B7355]">
            <Link href="/signin" className="text-[#6B2D2D] underline underline-offset-4">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
