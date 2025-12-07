"use server"
import { z } from 'zod'
import { getTransport } from '@/lib/email'
import { prisma } from '@/lib/db'

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  honey: z.string().max(0).optional(), // honeypot (should stay empty)
})

export async function submitContact(formData: FormData) {
  const raw = {
    name: String(formData.get('name')||''),
    email: String(formData.get('email')||''),
    subject: String(formData.get('subject')||''),
    message: String(formData.get('message')||''),
    phone: String(formData.get('phone')||''),
    honey: String(formData.get('website')||''), // honeypot field name 'website'
  }
  const parsed = contactSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string,string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string
      fieldErrors[key] = fieldErrors[key] ? [...fieldErrors[key], issue.message] : [issue.message]
    }
    return { ok: false as const, fieldErrors }
  }
  // Spam check
  if (parsed.data.honey) return { ok: true as const, ignored: true as const }

  try {
    const { name, email, subject, message, phone } = parsed.data
    // Persist message
    const record = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        phone: phone || undefined,
      },
    })

    // Notify via email (best-effort; failure doesn't remove stored message)
    try {
      const transporter = getTransport()
      const adminEmail = process.env.CONTACT_TARGET || process.env.SMTP_FROM || 'contact@example.com'
      const bodyHtml = `<p><strong>Nom:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
${phone ? `<p><strong>Téléphone:</strong> ${phone}</p>` : ''}
<p><strong>Sujet:</strong> ${subject}</p>
<hr/><pre style="white-space:pre-wrap;font-family:inherit">${message.replace(/[<>]/g, c => c === '<' ? '&lt;' : '&gt;')}</pre>`
      await transporter.sendMail({
        from: adminEmail,
        to: adminEmail,
        subject: `[Contact] ${subject}`,
        html: bodyHtml,
        replyTo: email,
      })
    } catch (mailErr) {
      if (process.env.NODE_ENV !== 'production') console.error('contact email send failed (message stored)', mailErr)
    }
    return { ok: true as const, id: record.id }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.error('contact email failed', e)
    return { ok: false as const, error: 'SEND_FAILED' as const }
  }
}
