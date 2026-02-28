"use client"
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ClientEnhancements({ success, error }: { success: string | null; error: string | null }) {
  useEffect(() => {
    if (success) {
      const msg = success === 'created' ? 'Œuvre créée' : success === 'updated' ? 'Œuvre mise à jour' : success === 'deleted' ? 'Œuvre supprimée' : success === 'image-removed' ? 'Image supprimée' : 'Succès'
      toast.success(msg)
    }
  }, [success])
  useEffect(() => {
    if (error) {
      toast.error(
        error === 'invalid' ? 'Données invalides' :
        error === 'unknown' ? 'Erreur inattendue' :
        error === 'linked' ? 'Impossible de supprimer (liée à une commande)' :
        error === 'has-orders' ? 'Impossible de supprimer : cette œuvre a été commandée' :
        error === 'media' ? 'Configuration média manquante' :
        error === 'file-too-large' ? 'Image > 5MB' :
        error === 'payload-too-large' ? 'Taille totale des images trop grande' :
        error
      )
    }
  }, [error])
  return null
}

interface MultiImageDropProps {
  name: string
  max?: number
}

export function MultiImageDrop({ name, max = 8 }: MultiImageDropProps) {
  const [files, setFiles] = useState<File[]>([])
  const [totalBytes, setTotalBytes] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5MB
  const MAX_TOTAL_BYTES = 15.5 * 1024 * 1024 // stay under 16MB server action limit
  const formatMB = (n: number) => (n / (1024 * 1024)).toFixed(2)
  const onFiles = useCallback((list: FileList | null) => {
    if (!list) return
  const next: File[] = [...files]
  let cumulative = next.reduce((sum, f) => sum + f.size, 0)
    for (const f of Array.from(list)) {
      if (next.length >= max) {
        toast.warning(`Maximum ${max} images reached`)
        break
      }
      if (f.size > MAX_FILE_BYTES) {
        toast.error(`"${f.name}" dépasse 5MB`)
        continue
      }
      if (cumulative + f.size > MAX_TOTAL_BYTES) {
        toast.error(`Taille totale (${formatMB(cumulative + f.size)}MB) > ${formatMB(MAX_TOTAL_BYTES)}MB`)
        break
      }
      next.push(f)
      cumulative += f.size
    }
    setFiles(next)
    setTotalBytes(cumulative)
    // Sync accumulated files back to the real file input via DataTransfer
    if (inputRef.current) {
      const dt = new DataTransfer()
      next.forEach(f => dt.items.add(f))
      inputRef.current.files = dt.files
    }
  }, [files, max, MAX_FILE_BYTES, MAX_TOTAL_BYTES])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    onFiles(e.dataTransfer.files)
  }, [onFiles])
  const removeAt = (i: number) => {
    setFiles(prev => {
      const next = prev.filter((_, idx) => idx !== i)
      setTotalBytes(next.reduce((sum, f) => sum + f.size, 0))
      if (inputRef.current) {
        const dt = new DataTransfer()
        next.forEach(f => dt.items.add(f))
        inputRef.current.files = dt.files
      }
      return next
    })
  }
  return (
    <div className="space-y-2">
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        className="border border-dashed rounded p-4 text-center text-sm cursor-pointer hover:bg-muted/30"
        onClick={() => inputRef.current?.click()}
      >
        <p className="mb-1 font-medium">Images</p>
        <p className="text-xs text-muted-foreground">Drag & drop or click to select (up to {max})</p>
        <input
          ref={inputRef}
          multiple
          type="file"
          name={name}
          accept="image/*"
          className="hidden"
          onChange={e => onFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <>
        <div className="text-xs text-muted-foreground">Total: {formatMB(totalBytes)}MB / {formatMB(MAX_TOTAL_BYTES)}MB</div>
        <ul className="flex flex-wrap gap-2">
          {files.map((f, i) => {
            const url = URL.createObjectURL(f)
            return (
              <li key={i} className="relative w-20 h-20 border rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={f.name} className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="absolute top-0 right-0 bg-black/60 text-white text-[10px] px-1"
                  aria-label="Remove"
                >×</button>
              </li>
            )
          })}
        </ul>
        </>
      )}
    </div>
  )
}

/**
 * Upload files directly from the browser to Cloudinary using a signed request.
 * Returns an array of Cloudinary secure URLs.
 */
async function uploadFilesToCloudinary(files: File[]): Promise<string[]> {
  if (files.length === 0) return []

  // 1. Get a signed upload token from our API
  const signRes = await fetch('/api/admin/cloudinary-sign')
  if (!signRes.ok) throw new Error('Failed to get upload signature')
  const { signature, timestamp, folder, cloudName, apiKey } = await signRes.json()

  // 2. Upload each file directly to Cloudinary
  const urls: string[] = []
  for (const file of files) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('api_key', apiKey)
    fd.append('timestamp', String(timestamp))
    fd.append('signature', signature)
    fd.append('folder', folder)

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: fd }
    )
    if (!uploadRes.ok) throw new Error('Cloudinary upload failed')
    const result = await uploadRes.json()
    urls.push(result.secure_url)
  }
  return urls
}

/**
 * Client wrapper for painting forms.
 * Images are uploaded directly to Cloudinary from the browser (bypasses Vercel body size limit),
 * then only the URLs are sent to the API route.
 */
export function PaintingForm({
  method = 'POST',
  children,
  className,
}: {
  method?: 'POST' | 'PUT'
  children: React.ReactNode
  className?: string
}) {
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    const fd = new FormData(form)
    setPending(true)
    try {
      // Extract image files from form data
      const imageFiles = (fd.getAll('images') as File[]).filter(f => f && f.size > 0)

      // Validate file sizes client-side
      for (const f of imageFiles) {
        if (f.size > 5 * 1024 * 1024) {
          toast.error(`Image "${f.name}" dépasse 5 MB`)
          setPending(false)
          return
        }
      }

      // Upload images directly to Cloudinary
      let imageUrls: string[] = []
      if (imageFiles.length > 0) {
        setStatus(`Upload des images (0/${imageFiles.length})…`)
        imageUrls = await uploadFilesToCloudinary(imageFiles)
        setStatus('')
      }

      // Remove file entries from form data, add Cloudinary URLs instead
      fd.delete('images')
      for (const url of imageUrls) {
        fd.append('imageUrls', url)
      }

      // Send form data (text fields + image URLs only) to our API
      const res = await fetch('/api/admin/paintings', {
        method,
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(
          data.error === 'invalid' ? 'Données invalides' :
          data.error === 'unauthorized' ? 'Non autorisé' :
          'Erreur inattendue'
        )
      } else {
        toast.success(
          data.success === 'created' ? 'Œuvre créée' :
          data.success === 'updated' ? 'Œuvre mise à jour' :
          'Succès'
        )
        router.refresh()
        form.reset()
      }
    } catch (err) {
      console.error('PaintingForm error:', err)
      toast.error('Erreur réseau — vérifiez votre connexion et réessayez')
    } finally {
      setPending(false)
      setStatus('')
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={className}>
      {children}
      {pending && <p className="text-xs text-muted-foreground animate-pulse">{status || 'Envoi en cours…'}</p>}
    </form>
  )
}
