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
 * Client wrapper for painting forms that submits via fetch to the API route.
 * This avoids React server action multipart parsing issues with file inputs.
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
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    const fd = new FormData(form)
    setPending(true)
    try {
      const res = await fetch('/api/admin/paintings', {
        method,
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(
          data.error === 'invalid' ? 'Données invalides' :
          data.error === 'file-too-large' ? 'Image > 5MB' :
          data.error === 'payload-too-large' ? 'Taille totale des images trop grande' :
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
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setPending(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={className}>
      {children}
      {pending && <p className="text-xs text-muted-foreground animate-pulse">Envoi en cours…</p>}
    </form>
  )
}
