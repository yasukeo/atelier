"use client"
import { useState, useTransition } from 'react'
import { submitContact } from './actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Notice } from '@/components/AuthShell'

interface FieldErrors { [k: string]: string[] }

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string[]; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-encre mb-2">
        {label}{hint && <span className="font-normal text-pierre"> {hint}</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1.5 text-[13px] text-destructive">{error[0]}</p>}
    </div>
  )
}

export function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, start] = useTransition()
  const [sent, setSent] = useState(false)
  const a11y = (key: string) => ({
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `contact-${key}-error` : undefined,
  })

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        setErrors({})
        setSent(false)
        const form = e.currentTarget as HTMLFormElement
        const fd = new FormData(form)
        start(async () => {
          const res = await submitContact(fd)
          if (!res.ok) {
            if ('fieldErrors' in res) setErrors(res.fieldErrors || {})
            else if (res.error === 'RATE_LIMITED') toast.error('Trop de messages envoyés. Réessayez dans une heure.')
            else toast.error("L'envoi a échoué. Réessayez plus tard ou écrivez à contact@elwarcha.com.")
            return
          }
          // success (normal or honeypot)
          setSent(true)
          form.reset()
        })
      }}
      className="space-y-6"
      autoComplete="off"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Field id="contact-name" label="Nom" error={errors.name}>
          <Input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={80} {...a11y('name')} />
        </Field>
        <Field id="contact-email" label="Email" error={errors.email}>
          <Input id="contact-email" type="email" name="email" autoComplete="email" required {...a11y('email')} />
        </Field>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field id="contact-phone" label="Téléphone" hint="(facultatif)" error={errors.phone}>
          <Input id="contact-phone" name="phone" type="tel" autoComplete="tel" placeholder="+212…" {...a11y('phone')} />
        </Field>
        <Field id="contact-subject" label="Sujet" error={errors.subject}>
          <Input id="contact-subject" name="subject" defaultValue={defaultSubject} required minLength={3} maxLength={120} {...a11y('subject')} />
        </Field>
      </div>
      <Field id="contact-message" label="Message" error={errors.message}>
        <Textarea id="contact-message" name="message" required minLength={10} maxLength={2000} rows={7} {...a11y('message')} />
      </Field>
      <div className="hidden"><input type="text" name="website" tabIndex={-1} autoComplete="off" /></div>
      {sent && <Notice tone="success">Message envoyé. L&apos;atelier vous répond par email.</Notice>}
      <button type="submit" disabled={pending} className="btn-primaire">{pending ? 'Envoi…' : 'Envoyer le message'}</button>
    </form>
  )
}
