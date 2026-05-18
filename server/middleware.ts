import type { Context, Next } from 'hono'
import { verifyToken, type SessionPayload } from './auth'

export type AppVariables = { session: SessionPayload }

export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  try {
    const session = await verifyToken(header.slice(7))
    c.set('session', session)
    await next()
  } catch {
    return c.json({ error: 'Invalid or expired session' }, 401)
  }
}

export async function requireAdmin(c: Context, next: Next) {
  const session = c.get('session') as SessionPayload
  if (session.role !== 'superadmin') {
    return c.json({ error: 'Forbidden' }, 403)
  }
  await next()
}
