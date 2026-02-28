import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Returns a signed upload params object for direct browser → Cloudinary uploads.
 * Only accessible to admin users.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as { role?: string } | undefined)?.role
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const timestamp = Math.round(Date.now() / 1000)
    const params = {
      timestamp,
      folder: 'atelier',
      resource_type: 'image' as const,
    }

    const signature = cloudinary.utils.api_sign_request(
      { timestamp: params.timestamp, folder: params.folder },
      process.env.CLOUDINARY_API_SECRET!
    )

    return NextResponse.json({
      signature,
      timestamp: params.timestamp,
      folder: params.folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    })
  } catch {
    return NextResponse.json({ error: 'sign_failed' }, { status: 500 })
  }
}
