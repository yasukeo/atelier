"use client"
import { signIn } from 'next-auth/react'
import { useState, useTransition, FormEvent, Suspense } from 'react'
import { Input } from '@/components/ui/input'
import { fr, t } from '@/lib/i18n'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { registerUser } from './actions'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthShell, Notice } from '@/components/AuthShell'
import { EyeIcon, EyeOffIcon } from '@/components/icons'
import { safeCallbackUrl } from '@/lib/format'

const registerFieldMessages: Record<string, string> = {
  name: 'Nom invalide (2 à 80 caractères)',
  email: 'Email invalide',
  password: 'Mot de passe invalide (6 à 100 caractères)',
}

// Built from known field codes only, so a crafted link can't display arbitrary text
function registerValidationMessage(fields: string | null) {
  const messages = (fields ?? '').split(',').map(f => registerFieldMessages[f]).filter(Boolean)
  return messages.length ? messages.join(', ') : 'Informations invalides.'
}

function urlMessages(params: URLSearchParams): { error: string | null; success: string | null } {
  const e = params.get('error')
  if (e === 'exists') return { error: 'Un compte existe déjà avec cet email.', success: null }
  if (e === 'validation') return { error: registerValidationMessage(params.get('fields')), success: null }
  if (e === 'invalid') return { error: 'Informations invalides.', success: null }
  if (e === 'rate-limited') return { error: 'Trop de comptes créés depuis cette connexion. Réessayez dans une heure.', success: null }
  if (e) return { error: 'Une erreur est survenue. Veuillez réessayer.', success: null }
  const s = params.get('success')
  if (s === 'registered') return { error: null, success: 'Compte créé. Vous pouvez vous connecter.' }
  if (s === 'password-reset') return { error: null, success: 'Mot de passe modifié. Vous pouvez vous connecter.' }
  return { error: null, success: null }
}

export default function SignInPage() {
  return <Suspense><SignInContent /></Suspense>
}

function SignInContent() {
  const params = useSearchParams()
  const callbackUrl = safeCallbackUrl(params.get('callbackUrl'))
  const fromCheckout = callbackUrl.startsWith('/checkout')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegPasswordConfirm, setShowRegPasswordConfirm] = useState(false)
  const [pending, startTransition] = useTransition()

  // Messages come from the URL (server action redirects) unless a local submit replaced them;
  // a new URL brings its own message back (state adjusted during render, not in an effect)
  const [localError, setLocalError] = useState<string | null | undefined>(undefined)
  const paramsKey = params.toString()
  const [shownParamsKey, setShownParamsKey] = useState(paramsKey)
  const urlTab = params.get('tab') === 'register' ? 'register' : 'login'
  const [tab, setTab] = useState(urlTab)
  if (paramsKey !== shownParamsKey) {
    setShownParamsKey(paramsKey)
    setLocalError(undefined)
    setTab(urlTab)
  }
  const fromUrl = urlMessages(params)
  const error = localError !== undefined ? localError : fromUrl.error
  const success = localError !== undefined ? null : fromUrl.success
  const setError = (message: string | null) => setLocalError(message)

  async function onLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error === 'TooManyAttempts') setError('Trop de tentatives de connexion. Réessayez dans 15 minutes ou réinitialisez votre mot de passe.')
    else if (res?.error) setError(t('auth.signIn.error', fr))
    else window.location.href = callbackUrl
  }

  function onRegister(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (regPassword !== regPasswordConfirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    const fd = new FormData()
    fd.set('name', regName)
    fd.set('email', regEmail)
    fd.set('password', regPassword)
    fd.set('callbackUrl', callbackUrl)
    startTransition(async () => {
      await registerUser(fd)
    })
  }

  const label = 'block text-[13px] font-medium text-encre mb-2'
  const tabClass = 'flex-none h-11 px-0 mr-8 rounded-none border-0 border-b-2 border-transparent bg-transparent text-[15px] text-encre/60 shadow-none data-[state=active]:border-encre data-[state=active]:text-encre data-[state=active]:shadow-none data-[state=active]:bg-transparent'

  return (
    <AuthShell
      title={tab === 'register' ? 'Créer un compte' : 'Connexion'}
      intro={fromCheckout
        ? 'Connectez-vous ou créez un compte pour finaliser votre commande. Votre panier est conservé.'
        : 'Un compte suffit pour commander et suivre vos commandes.'}
    >
      {error && <Notice tone="error" className="mb-6">{error}</Notice>}
      {success && <Notice tone="success" className="mb-6">{success}</Notice>}
      <Tabs value={tab} onValueChange={v => setTab(v === 'register' ? 'register' : 'login')} className="w-full gap-8">
        <TabsList className="h-auto w-full justify-start rounded-none border-b border-trait bg-transparent p-0">
          <TabsTrigger value="login" className={tabClass}>{t('auth.signIn.title', fr)}</TabsTrigger>
          <TabsTrigger value="register" className={tabClass}>Créer un compte</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <form onSubmit={onLogin} className="space-y-6">
            <div>
              <label htmlFor="login-email" className={label}>{t('auth.signIn.email', fr)}</label>
              <Input id="login-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vous@exemple.com" />
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label htmlFor="login-password" className="text-[13px] font-medium text-encre">{t('auth.signIn.password', fr)}</label>
                <Link href="/forgot-password" className="text-[13px] text-pierre hover:text-encre underline underline-offset-4 decoration-trait">Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <Input id="login-password" autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showPassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-pierre hover:text-encre">
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primaire w-full h-12" disabled={pending}>{t('auth.signIn.submit', fr)}</button>
          </form>
        </TabsContent>
        <TabsContent value="register">
          <form onSubmit={onRegister} className="space-y-6">
            <div>
              <label htmlFor="reg-name" className={label}>Nom</label>
              <Input id="reg-name" autoComplete="name" value={regName} onChange={e => setRegName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="reg-email" className={label}>Email</label>
              <Input id="reg-email" type="email" autoComplete="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="vous@exemple.com" />
            </div>
            <div>
              <label htmlFor="reg-password" className={label}>Mot de passe <span className="font-normal text-pierre">(6 caractères minimum)</span></label>
              <div className="relative">
                <Input id="reg-password" autoComplete="new-password" type={showRegPassword ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} required minLength={6} maxLength={100} className="pr-10" />
                <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} aria-label={showRegPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showRegPassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-pierre hover:text-encre">
                  {showRegPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="reg-password-confirm" className={label}>Confirmer le mot de passe</label>
              <div className="relative">
                <Input id="reg-password-confirm" autoComplete="new-password" type={showRegPasswordConfirm ? 'text' : 'password'} value={regPasswordConfirm} onChange={e => setRegPasswordConfirm(e.target.value)} required className="pr-10" />
                <button type="button" onClick={() => setShowRegPasswordConfirm(!showRegPasswordConfirm)} aria-label={showRegPasswordConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showRegPasswordConfirm} className="absolute right-3 top-1/2 -translate-y-1/2 text-pierre hover:text-encre">
                  {showRegPasswordConfirm ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primaire w-full h-12" disabled={pending}>{pending ? 'Création du compte…' : 'Créer mon compte'}</button>
          </form>
        </TabsContent>
      </Tabs>
      <p className="mt-10 text-[12px] text-pierre leading-relaxed">
        En continuant, vous acceptez les <Link href="/terms" className="underline underline-offset-2 hover:text-encre">conditions d&apos;utilisation</Link> et la <Link href="/privacy" className="underline underline-offset-2 hover:text-encre">politique de confidentialité</Link>.
      </p>
    </AuthShell>
  )
}
