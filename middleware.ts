import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { JWT } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = (await getToken({ req })) as (JWT & { role?: 'ADMIN' | 'CUSTOMER' }) | null
  const isAdmin = token?.role === 'ADMIN'
  if (!isAdmin) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
