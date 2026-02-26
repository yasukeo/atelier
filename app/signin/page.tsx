"use client"
import { signIn } from 'next-auth/react'
import { useState, useTransition, FormEvent, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fr, t } from '@/lib/i18n'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { registerUser } from './actions'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { EyeIcon, EyeOffIcon } from '@/components/icons'

export default function SignInPage() {
  return <Suspense><SignInContent /></Suspense>
}

function SignInContent() {
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegPasswordConfirm, setShowRegPasswordConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    const e = params.get('error')
    const msg = params.get('msg')
    if (e) {
      if (e === 'exists') setError('Un compte existe déjà avec cet email.')
      else if (e === 'validation' && msg) setError(msg)
      else if (e === 'invalid') setError('Informations invalides.')
      else setError('Une erreur est survenue. Veuillez réessayer.')
    } else if (params.get('success')) {
      const s = params.get('success')
      if (s === 'registered') setSuccess('Compte créé. Vous pouvez vous connecter.')
      else if (s === 'password-reset') setSuccess('Mot de passe modifié. Vous pouvez vous connecter.')
    } else {
      setError(null); setSuccess(null)
    }
  }, [params])

  async function onLogin(e: FormEvent) {
    e.preventDefault()
    setError(null); setSuccess(null)
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) setError(t('auth.signIn.error', fr))
    else window.location.href = '/'
  }

  function onRegister(e: FormEvent) {
    e.preventDefault()
    setError(null); setSuccess(null)
    if (regPassword !== regPasswordConfirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    const fd = new FormData()
    fd.set('name', regName)
    fd.set('email', regEmail)
    fd.set('password', regPassword)
    startTransition(async () => {
      await registerUser(fd)
    })
  }

  return (
    <div className="min-h-screen bg-[#E9E7DB] flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-xl">
        <div className="bg-[#E9E7DB] border border-[#D8D5C8] rounded-xl shadow-lg p-8">
          <div className="mb-6 text-center space-y-3">
            <Image src="/logos/Plan de travail 11.png" alt="Elwarcha الورشة" width={130} height={100} className="mx-auto object-contain" />
            <h1 className="text-2xl font-semibold tracking-tight text-[#6B2D2D]">Bienvenue</h1>
            <p className="text-sm text-[#8B7355]">Connectez-vous ou créez un compte pour continuer.</p>
          </div>
          {error && <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
          {success && <div className="mb-4 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded p-2">{success}</div>}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">{t('auth.signIn.title', fr)}</TabsTrigger>
              <TabsTrigger value="register">Créer un compte</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="outline-none">
              <form onSubmit={onLogin} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="login-email" className="text-xs font-medium">{t('auth.signIn.email', fr)}</label>
                  <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vous@exemple.com" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-xs font-medium">{t('auth.signIn.password', fr)}</label>
                    <a href="/forgot-password" className="text-xs text-[#6B2D2D] hover:underline">Mot de passe oublié ?</a>
                  </div>
                  <div className="relative">
                    <Input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••" className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#6B2D2D]">
                      {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={pending}>{pending ? '...' : t('auth.signIn.submit', fr)}</Button>
              </form>
            </TabsContent>
            <TabsContent value="register" className="outline-none">
              <form onSubmit={onRegister} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="reg-name" className="text-xs font-medium">Nom</label>
                  <Input id="reg-name" value={regName} onChange={e => setRegName(e.target.value)} required placeholder="Votre nom" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-email" className="text-xs font-medium">Email</label>
                  <Input id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="vous@exemple.com" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-password" className="text-xs font-medium">Mot de passe</label>
                  <div className="relative">
                    <Input id="reg-password" type={showRegPassword ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} required placeholder="Minimum 6 caractères" className="pr-10" />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#6B2D2D]">
                      {showRegPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-password-confirm" className="text-xs font-medium">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Input id="reg-password-confirm" type={showRegPasswordConfirm ? 'text' : 'password'} value={regPasswordConfirm} onChange={e => setRegPasswordConfirm(e.target.value)} required placeholder="Retapez le mot de passe" className="pr-10" />
                    <button type="button" onClick={() => setShowRegPasswordConfirm(!showRegPasswordConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7355] hover:text-[#6B2D2D]">
                      {showRegPasswordConfirm ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={pending}>{pending ? '...' : 'Créer un compte'}</Button>
              </form>
            </TabsContent>
          </Tabs>
          <p className="mt-8 text-[10px] text-[#8B7355] text-center leading-relaxed">
            En continuant vous acceptez nos conditions d&apos;utilisation et politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  )
}
