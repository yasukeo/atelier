"use client"
import { useTransition } from 'react'
import { deleteMessage } from './[id]/actions'

export function DeleteMessageButton({ id, small }: { id: string; small?: boolean }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm('Supprimer ce message ?')) return
        start(async () => {
          await deleteMessage(id)
        })
      }}
      className={small ? "text-xs text-red-600 hover:underline disabled:opacity-50" : "text-sm text-red-600 hover:underline disabled:opacity-50"}
    >
      {pending ? 'Suppression...' : 'Supprimer'}
    </button>
  )
}
