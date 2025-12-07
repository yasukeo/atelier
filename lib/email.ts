import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'Elwarcha <onboarding@resend.dev>'
const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// ==================== Order Confirmation ====================

interface OrderItem {
  title: string
  quantity: number
  unitPrice: number
  dimensions?: string
}

interface OrderEmailData {
  orderId: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  discount?: { code: string; percent: number }
  shippingFee: number
  total: number
  address: string
  phone: string
}

export async function sendOrderConfirmation(to: string, data: OrderEmailData) {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #E9E7DB;">
        <strong>${item.title}</strong>
        ${item.dimensions ? `<br><span style="color: #8B7355; font-size: 12px;">${item.dimensions}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #E9E7DB; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E9E7DB; text-align: right;">${formatMAD(item.unitPrice * item.quantity)}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F5F0; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FDFCFA; border-radius: 12px; overflow: hidden; border: 1px solid #DCD9CC;">
        <!-- Header -->
        <div style="background-color: #E9E7DB; padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: #6B2D2D; font-size: 24px;">Elwarcha | الورشة</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
          <h2 style="color: #6B2D2D; margin: 0 0 8px;">Merci pour votre commande !</h2>
          <p style="color: #8B7355; margin: 0 0 24px;">Bonjour ${data.customerName},</p>
          
          <p style="color: #2D2A26; margin: 0 0 24px;">
            Votre commande <strong>#${data.orderId.slice(-8).toUpperCase()}</strong> a bien été reçue. 
            Nous vous tiendrons informé de son avancement.
          </p>
          
          <!-- Order Items -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #F7F5F0;">
                <th style="padding: 12px; text-align: left; color: #6B2D2D; font-size: 12px; text-transform: uppercase;">Article</th>
                <th style="padding: 12px; text-align: center; color: #6B2D2D; font-size: 12px; text-transform: uppercase;">Qté</th>
                <th style="padding: 12px; text-align: right; color: #6B2D2D; font-size: 12px; text-transform: uppercase;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <!-- Totals -->
          <table style="width: 100%; background-color: #F7F5F0; border-radius: 8px; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px 16px; color: #8B7355;">Sous-total</td>
              <td style="padding: 12px 16px; color: #2D2A26; text-align: right;">${formatMAD(data.subtotal)}</td>
            </tr>
            ${data.discount ? `
              <tr>
                <td style="padding: 12px 16px; color: #22C55E;">Réduction (${data.discount.code})</td>
                <td style="padding: 12px 16px; color: #22C55E; text-align: right;">-${data.discount.percent}%</td>
              </tr>
            ` : ''}
            <tr>
              <td style="padding: 12px 16px; color: #8B7355;">Livraison</td>
              <td style="padding: 12px 16px; color: #2D2A26; text-align: right;">${data.shippingFee > 0 ? formatMAD(data.shippingFee) : 'Gratuite'}</td>
            </tr>
            <tr style="border-top: 1px solid #DCD9CC;">
              <td style="padding: 16px; color: #6B2D2D; font-weight: 600; font-size: 18px;">Total</td>
              <td style="padding: 16px; color: #6B2D2D; font-weight: 600; font-size: 18px; text-align: right;">${formatMAD(data.total)}</td>
            </tr>
          </table>
          
          <!-- Delivery Info -->
          <div style="margin-bottom: 24px;">
            <h3 style="color: #6B2D2D; font-size: 14px; margin: 0 0 8px;">Adresse de livraison</h3>
            <p style="color: #2D2A26; margin: 0;">${data.address}</p>
            <p style="color: #8B7355; margin: 4px 0 0;">Tél: ${data.phone}</p>
          </div>
          
          <!-- CTA -->
          <div style="text-align: center;">
            <a href="${SITE_URL}/orders" style="display: inline-block; background-color: #6B2D2D; color: white; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: 500;">
              Suivre ma commande
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #E9E7DB; padding: 24px; text-align: center;">
          <p style="color: #8B7355; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Elwarcha. Tous droits réservés.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Confirmation de commande #${data.orderId.slice(-8).toUpperCase()}`,
    html,
  })

  if (error) {
    console.error('Failed to send order confirmation email:', error)
    throw error
  }
}

// ==================== Password Reset ====================

export async function sendPasswordResetEmail(to: string, token: string, userName?: string) {
  const resetUrl = `${SITE_URL}/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F5F0; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FDFCFA; border-radius: 12px; overflow: hidden; border: 1px solid #DCD9CC;">
        <!-- Header -->
        <div style="background-color: #E9E7DB; padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: #6B2D2D; font-size: 24px;">Elwarcha | الورشة</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
          <h2 style="color: #6B2D2D; margin: 0 0 16px;">Réinitialisation du mot de passe</h2>
          <p style="color: #2D2A26; margin: 0 0 24px;">
            Bonjour${userName ? ` ${userName}` : ''},
          </p>
          <p style="color: #2D2A26; margin: 0 0 24px;">
            Vous avez demandé la réinitialisation de votre mot de passe. 
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
          </p>
          
          <!-- CTA -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #6B2D2D; color: white; padding: 14px 40px; border-radius: 24px; text-decoration: none; font-weight: 500;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #8B7355; font-size: 14px; margin: 0 0 16px;">
            Ce lien est valide pendant 30 minutes.
          </p>
          
          <p style="color: #8B7355; font-size: 14px; margin: 0;">
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #E9E7DB; margin: 24px 0;">
          
          <p style="color: #8B7355; font-size: 12px; margin: 0;">
            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
            <a href="${resetUrl}" style="color: #6B2D2D; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #E9E7DB; padding: 24px; text-align: center;">
          <p style="color: #8B7355; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Elwarcha. Tous droits réservés.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Réinitialisation de votre mot de passe - Elwarcha',
    html,
  })

  if (error) {
    console.error('Failed to send password reset email:', error)
    throw error
  }
}

// ==================== Order Status Update ====================

export async function sendOrderStatusUpdate(
  to: string,
  orderId: string,
  status: string,
  customerName?: string
) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    IN_PROGRESS: {
      title: 'Votre commande est en cours de préparation',
      message: 'Notre équipe prépare votre commande avec soin. Nous vous tiendrons informé de la suite.',
    },
    READY_FOR_DELIVERY: {
      title: 'Votre commande est prête !',
      message: 'Votre commande est prête et sera bientôt expédiée ou disponible pour retrait.',
    },
    COMPLETED: {
      title: 'Votre commande a été livrée',
      message: 'Nous espérons que vous apprécierez votre acquisition. Merci de votre confiance !',
    },
    CANCELED: {
      title: 'Votre commande a été annulée',
      message: 'Si vous avez des questions, n\'hésitez pas à nous contacter.',
    },
  }

  const statusInfo = statusMessages[status] || {
    title: 'Mise à jour de votre commande',
    message: 'Le statut de votre commande a été mis à jour.',
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F5F0; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FDFCFA; border-radius: 12px; overflow: hidden; border: 1px solid #DCD9CC;">
        <!-- Header -->
        <div style="background-color: #E9E7DB; padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: #6B2D2D; font-size: 24px;">Elwarcha | الورشة</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
          <h2 style="color: #6B2D2D; margin: 0 0 16px;">${statusInfo.title}</h2>
          <p style="color: #2D2A26; margin: 0 0 16px;">
            Bonjour${customerName ? ` ${customerName}` : ''},
          </p>
          <p style="color: #2D2A26; margin: 0 0 24px;">
            ${statusInfo.message}
          </p>
          
          <div style="background-color: #F7F5F0; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="color: #8B7355; font-size: 12px; margin: 0 0 4px;">Numéro de commande</p>
            <p style="color: #6B2D2D; font-size: 18px; font-weight: 600; margin: 0;">#${orderId.slice(-8).toUpperCase()}</p>
          </div>
          
          <!-- CTA -->
          <div style="text-align: center;">
            <a href="${SITE_URL}/orders" style="display: inline-block; background-color: #6B2D2D; color: white; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: 500;">
              Voir ma commande
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #E9E7DB; padding: 24px; text-align: center;">
          <p style="color: #8B7355; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Elwarcha. Tous droits réservés.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${statusInfo.title} - Commande #${orderId.slice(-8).toUpperCase()}`,
    html,
  })

  if (error) {
    console.error('Failed to send order status update email:', error)
    throw error
  }
}

// ==================== Helpers ====================

function formatMAD(value: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  }).format(value)
}
