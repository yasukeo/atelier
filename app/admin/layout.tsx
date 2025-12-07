"use client"
import { ReactNode } from 'react'
import { AdminShell } from './_components/sidebar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
