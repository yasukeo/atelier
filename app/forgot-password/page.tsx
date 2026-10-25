"use client"
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { requestPasswordReset } from './actions'
import { useTransition, Suspense } from 'react'
import { AuthShell, Notice } from '@/components/AuthShell'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  return <Suspense><ForgotPasswordContent /></Suspense>
}

function ForgotPasswordContent() {
  const params = useSearchParams()
  const error = params.get('error')
  const success = params.get('success')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await requestPasswordReset(formData)
    })
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      intro={success ? undefined : "Indiquez l'email de votre compte : nous vous envoyons un lien pour choisir un nouveau mot de passe."}
    >
      {error && (
        <Notice tone="error" className="mb-6">
          {error === 'invalid' ? "Cet email n'est pas valide. Vérifiez-le et réessayez." : "L'envoi a échoué. Réessayez dans quelques instants."}
        </Notice>
      )}

      {success ? (
        <div className="space-y-6">
          <Notice tone="success">Si un compte existe avec cet email, un lien de réinitialisation vient de partir. Pensez à regarder dans les spams.</Notice>
          <Link href="/signin" className="btn-secondaire w-full">Retour à la connexion</Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-encre mb-2">Email</label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="vous@exemple.com" />
            </div>
            <button type="submit" className="btn-primaire w-full h-12" disabled={pending}>
              {pending ? 'Envoi…' : 'Envoyer le lien'}
            </button>
          </form>
          <p className="mt-8 text-sm">
            <Link href="/signin" className="lien">Retour à la connexion</Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}
