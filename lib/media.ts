import { v2 as cloudinary } from 'cloudinary'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export function getAltText(artistName: string, title: string): string {
  return `Peinture de ${artistName} – ${title}`
}

export async function uploadImage(filePath: string, folder = 'atelier'): Promise<{ url: string }> {
  const res = await cloudinary.uploader.upload(filePath, { folder })
  return { url: res.secure_url }
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
}

export async function uploadImageFromBuffer(buffer: Buffer, filename?: string, folder = 'atelier'):
  Promise<{ url: string; publicId: string }>
{
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        filename_override: filename,
        use_filename: Boolean(filename),
        unique_filename: true,
      },
      (err, result) => {
        if (err || !result) return reject(err)
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

// Local filesystem fallback: saves to public/paintings and returns a public URL
async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {}
}

function pickSafeExt(originalName?: string): string {
  const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp'])
  const ext = originalName ? path.extname(path.basename(originalName)).toLowerCase() : ''
  return allowed.has(ext) ? ext : '.jpg'
}

export async function saveImageBufferToLocal(buffer: Buffer, originalName?: string, subdir = 'paintings'):
  Promise<{ url: string; filePath: string }>
{
  const ext = pickSafeExt(originalName)
  const name = `${crypto.randomUUID()}${ext}`
  const dir = path.join(process.cwd(), 'public', subdir)
  await ensureDir(dir)
  const filePath = path.join(dir, name)
  await fs.writeFile(filePath, buffer)
  const url = `/${subdir}/${name}`
  return { url, filePath }
}

// Unified helper: uses Cloudinary if configured, otherwise local filesystem
export async function storeImage(buffer: Buffer, filename?: string): Promise<{ url: string }> {
  if (isCloudinaryConfigured()) {
    const { url } = await uploadImageFromBuffer(buffer, filename)
    return { url }
  }
  const { url } = await saveImageBufferToLocal(buffer, filename, 'paintings')
  return { url }
}
