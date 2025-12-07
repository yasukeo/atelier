import { type DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & { role?: import('./lib/auth').Role }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: import('./lib/auth').Role
  }
}
