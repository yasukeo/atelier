"use client"
import { useState, useTransition } from 'react'
import { submitContact } from './actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface FieldErrors { [k: string]: string[] }

export function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pending, start] = useTransition()
  const [sent, setSent] = useState(false)

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        setErrors({})
        const form = e.currentTarget as HTMLFormElement
        const fd = new FormData(form)
        start(async () => {
          const res = await submitContact(fd)
          if (!res.ok) {
            if ('fieldErrors' in res) setErrors(res.fieldErrors || {})
            else toast.error('Envoi impossible, réessaie plus tard.')
            return
          }
            // success (normal or honeypot)
          setSent(true)
          if (!('ignored' in res && res.ignored)) {
            toast.success('Message envoyé !')
          }
          form.reset()
        })
      }}
      className="space-y-4"
      autoComplete="off"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1">Nom *</label>
          <Input name="name" required minLength={2} maxLength={80} aria-invalid={!!errors.name} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Email *</label>
          <Input type="email" name="email" required aria-invalid={!!errors.email} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email[0]}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1">Téléphone (optionnel)</label>
          <Input name="phone" placeholder="+212..." aria-invalid={!!errors.phone} />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Sujet *</label>
          <Input name="subject" required minLength={3} maxLength={120} aria-invalid={!!errors.subject} />
          {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject[0]}</p>}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Message *</label>
        <Textarea name="message" required minLength={10} maxLength={2000} rows={6} aria-invalid={!!errors.message} />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message[0]}</p>}
      </div>
      <div className="hidden"><input type="text" name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>{pending ? 'Envoi...' : 'Envoyer'}</Button>
        {sent && <span className="text-xs text-green-600">Merci, votre message a été envoyé.</span>}
      </div>
    </form>
  )
}

export function ContactCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Envoyer un message</CardTitle>
      </CardHeader>
      <CardContent>
        <ContactForm />
      </CardContent>
    </Card>
  )
}
