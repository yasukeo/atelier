"use client"
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export default function ClientEnhancements({ success, error }: { success: string | null; error: string | null }) {
  useEffect(() => {
    if (success) {
      const msg = success === 'created' ? 'Painting created' : success === 'updated' ? 'Painting updated' : success === 'deleted' ? 'Painting deleted' : success === 'image-removed' ? 'Image removed' : 'Success'
      toast.success(msg)
    }
  }, [success])
  useEffect(() => {
    if (error) {
      toast.error(error === 'invalid' ? 'Invalid data' : error === 'unknown' ? 'Unexpected error' : error === 'linked' ? 'Cannot delete (linked)' : error === 'media' ? 'Media config missing' : error)
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
  const inputRef = useRef<HTMLInputElement | null>(null)
  const onFiles = useCallback((list: FileList | null) => {
    if (!list) return
    const next: File[] = [...files]
    for (const f of Array.from(list)) {
      if (next.length >= max) break
      next.push(f)
    }
    setFiles(next)
  }, [files, max])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    onFiles(e.dataTransfer.files)
  }, [onFiles])
  const removeAt = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
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
            hidden
            onChange={e => onFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
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
                {/* Hidden input per file so server receives all */}
              </li>
            )
          })}
        </ul>
      )}
      {/* Hidden inputs mirroring files for form submission when replaced (since we rely on <input multiple>) */}
    </div>
  )
}