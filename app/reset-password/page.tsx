"use client"
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { resetPassword } from './actions'
import { useTransition, Suspense } from 'react'
import { AuthShell, Notice } from '@/components/AuthShell'
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
    'invalid-password': 'Le mot de passe doit contenir entre 6 et 100 caractères.',
  }

  // Only known codes are shown, so a crafted link can't display arbitrary text
  const displayError = error ? (errorMessages[error] || 'Une erreur est survenue.') : null

  // No token, or a token that can no longer be used: no form, only a way to get a new link
  if ((!token && !error) || error === 'invalid-token' || error === 'expired' || error === 'used') {
    return (
      <AuthShell title="Lien invalide" intro={displayError ?? 'Ce lien de réinitialisation est invalide ou a expiré.'}>
        <Link href="/forgot-password" className="btn-primaire w-full h-12">Demander un nouveau lien</Link>
      </AuthShell>
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
    <AuthShell title="Nouveau mot de passe" intro="Choisissez un mot de passe de 6 caractères minimum.">
      {displayError && <Notice tone="error" className="mb-6">{displayError}</Notice>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="token" value={token || ''} />
        <div>
          <label htmlFor="password" className="block text-[13px] font-medium text-encre mb-2">Nouveau mot de passe</label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={6} maxLength={100} />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-[13px] font-medium text-encre mb-2">Confirmer le mot de passe</label>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={6} maxLength={100} />
        </div>
        <button type="submit" className="btn-primaire w-full h-12" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
        </button>
      </form>
      <p className="mt-8 text-sm">
        <Link href="/signin" className="lien">Retour à la connexion</Link>
      </p>
    </AuthShell>
  )
}
