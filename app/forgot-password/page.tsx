"use client"
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requestPasswordReset } from './actions'
import { useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function ForgotPasswordPage() {
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
    <div className="min-h-screen bg-[#E9E7DB] flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md">
        <div className="bg-[#E9E7DB] border border-[#D8D5C8] rounded-xl shadow-lg p-8">
          <div className="mb-6 text-center">
            <Image src="/logos/Plan de travail 11.png" alt="Elwarcha" width={100} height={75} className="mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-[#6B2D2D]">Mot de passe oublié</h1>
            <p className="text-sm text-[#8B7355] mt-2">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>
          </div>

          {error && (
            <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error === 'invalid' ? 'Veuillez entrer un email valide.' : 'Une erreur est survenue.'}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📧</div>
              <div className="text-sm text-[#2D2A26]">
                Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.
              </div>
              <p className="text-xs text-[#8B7355]">
                Vérifiez votre boîte de réception et vos spams.
              </p>
              <Link href="/signin" className="inline-block text-[#6B2D2D] underline underline-offset-4 text-sm">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-medium text-[#2D2A26]">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="votre@email.com"
                    className="bg-[#FDFCFA] border-[#DCD9CC]"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#6B2D2D] hover:bg-[#5A2525]" 
                  disabled={pending}
                >
                  {pending ? 'Envoi...' : 'Envoyer le lien'}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-[#8B7355]">
                <Link href="/signin" className="text-[#6B2D2D] underline underline-offset-4">
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
