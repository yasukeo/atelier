import { createHash, randomBytes } from 'crypto'

/** Random token sent to the user (e.g. in a password reset link). */
export function generateToken() {
  return randomBytes(32).toString('hex')
}

/**
 * Only this hash is stored in the database, so a leaked table can't be used to reset passwords.
 * A fast hash is enough: the token is 256 random bits, not a user-chosen secret.
 */
export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
