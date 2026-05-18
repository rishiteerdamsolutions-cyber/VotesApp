import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { eq, and, sql, desc, gte } from 'drizzle-orm'
import { getDb, getDbAsync } from './db'
import { useLocalDatabase } from './env'
import {
  settings,
  constituencies,
  divisions,
  representatives,
  voters,
  canvassLogs,
  auditLogs,
} from '../drizzle/schema'
import { signToken, verifyToken } from './auth'
import {
  comparePassword,
  generatePassword,
  generateUsername,
  hashPassword,
} from './utils'
import { requireAuth, requireAdmin, type AppVariables } from './middleware'
import dayjs from 'dayjs'

const root = new Hono<{ Variables: AppVariables }>()
const api = new Hono<{ Variables: AppVariables }>()

root.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'] }))

let dbInitPromise: Promise<void> | null = null
root.use('*', async (c, next) => {
  try {
    if (!dbInitPromise) {
      dbInitPromise = getDbAsync().then(() => undefined)
    }
    await dbInitPromise
    await next()
  } catch (e) {
    console.error('[db] init failed:', e)
    dbInitPromise = null
    const msg = e instanceof Error ? e.message : 'Database unavailable'
    return c.json({ error: msg }, 503)
  }
})

root.onError((err, c) => {
  console.error('[api]', err)
  return c.json(
    { error: err instanceof Error ? err.message : 'Internal server error' },
    500
  )
})

api.get('/health', (c) =>
  c.json({
    ok: true,
    db: true,
    local: useLocalDatabase(),
  })
)

api.post('/auth/login', async (c) => {
  try {
    const { username, password, deviceId } = await c.req.json<{
      username: string
      password: string
      deviceId: string
    }>()
    if (!username || !password || !deviceId) {
      return c.json({ error: 'Missing credentials' }, 400)
    }
    const db = getDb()
    const [user] = await db
      .select()
      .from(representatives)
      .where(eq(representatives.username, username))
      .limit(1)
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return c.json({ error: 'Invalid username or password' }, 401)
    }
    if (!user.isActive) {
      return c.json({ error: 'Account is inactive' }, 403)
    }
    if (user.role === 'representative') {
      if (user.boundDeviceId && user.boundDeviceId !== deviceId) {
        return c.json(
          {
            error:
              'This account is registered on another device. Contact your super admin to reset.',
          },
          403
        )
      }
      if (!user.boundDeviceId) {
        await db
          .update(representatives)
          .set({
            boundDeviceId: deviceId,
            deviceBoundAt: new Date().toISOString(),
          })
          .where(eq(representatives.id, user.id))
      }
    }
    await db
      .update(representatives)
      .set({ lastLogin: new Date().toISOString() })
      .where(eq(representatives.id, user.id))
    const displayName = `${user.name} ${user.surname}`
    const token = await signToken({
      userId: user.id,
      role: user.role,
      divisionId: user.divisionId,
      constituencyId: user.constituencyId,
      name: displayName,
      username: user.username,
    })
    return c.json({
      token,
      user: {
        userId: user.id,
        role: user.role,
        divisionId: user.divisionId,
        constituencyId: user.constituencyId,
        name: displayName,
        username: user.username,
      },
    })
  } catch (e) {
    console.error(e)
    return c.json({ error: 'Database unavailable. Check DATABASE_URL.' }, 503)
  }
})

api.post('/auth/setup-admin', async (c) => {
  try {
    const db = getDb()
    const existing = await db
      .select()
      .from(representatives)
      .where(eq(representatives.role, 'superadmin'))
      .limit(1)
    if (existing.length) return c.json({ error: 'Super admin already exists' }, 400)
    const { password } = await c.req.json<{ password?: string }>()
    const pwd = password ?? process.env.ADMIN_DEFAULT_PASSWORD ?? '1KTR@1'
    await db.insert(representatives).values({
      username: 'admin',
      passwordHash: await hashPassword(pwd),
      surname: 'Admin',
      name: 'Super',
      lastName: 'User',
      mobile: '0000000000',
      role: 'superadmin',
      isActive: true,
    })
    const existingSetting = await db
      .select()
      .from(settings)
      .where(eq(settings.key, 'maxRepsPerDivision'))
      .limit(1)
    if (!existingSetting.length) {
      await db.insert(settings).values({ key: 'maxRepsPerDivision', value: '10' })
    }
    return c.json({ ok: true })
  } catch (e) {
    console.error('setup-admin:', e)
    const msg = e instanceof Error ? e.message : 'Setup failed'
    if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED')) {
      return c.json(
        {
          error:
            'Cannot connect to Neon. Set USE_LOCAL_DB=true in .env and restart the API (npm run dev).',
        },
        503
      )
    }
    if (msg.includes('relation') && msg.includes('does not exist')) {
      return c.json(
        { error: 'Database tables missing. Run: npm run db:migrate' },
        503
      )
    }
    return c.json({ error: msg || 'Setup failed' }, 500)
  }
})

api.get('/auth/check', async (c) => {
  try {
    const db = getDb()
    const [admin] = await db
      .select()
      .from(representatives)
      .where(eq(representatives.role, 'superadmin'))
      .limit(1)
    return c.json({ hasAdmin: !!admin })
  } catch {
    return c.json({ hasAdmin: false, db: false })
  }
})

const authed = new Hono<{ Variables: AppVariables }>()
authed.use('*', requireAuth)

authed.get('/settings', async (c) => {
  const db = getDb()
  const rows = await db.select().from(settings)
  const map: Record<string, string> = {}
  rows.forEach((r) => {
    map[r.key] = r.value
  })
  return c.json(map)
})

authed.put('/settings', requireAdmin, async (c) => {
  const db = getDb()
  const body = await c.req.json<Record<string, string>>()
  for (const [key, value] of Object.entries(body)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } })
  }
  return c.json({ ok: true })
})

authed.get('/constituencies', async (c) => {
  const db = getDb()
  const rows = await db.select().from(constituencies).orderBy(constituencies.name)
  return c.json(rows)
})

authed.post('/constituencies', requireAdmin, async (c) => {
  const db = getDb()
  const body = await c.req.json<{ name: string; corporation: string; city: string }>()
  const [row] = await db.insert(constituencies).values(body).returning()
  return c.json(row)
})

authed.delete('/constituencies/:id', requireAdmin, async (c) => {
  const db = getDb()
  const id = Number(c.req.param('id'))
  await db.delete(constituencies).where(eq(constituencies.id, id))
  return c.json({ ok: true })
})

authed.get('/divisions', async (c) => {
  const db = getDb()
  const constituencyId = c.req.query('constituencyId')
  const rows = constituencyId
    ? await db
        .select()
        .from(divisions)
        .where(eq(divisions.constituencyId, Number(constituencyId)))
    : await db.select().from(divisions)
  return c.json(rows)
})

authed.post('/divisions', requireAdmin, async (c) => {
  const db = getDb()
  const body = await c.req.json<{
    constituencyId: number
    divisionNumber: string
    name: string
  }>()
  const [row] = await db.insert(divisions).values(body).returning()
  return c.json(row)
})

authed.delete('/divisions/:id', requireAdmin, async (c) => {
  const db = getDb()
  await db.delete(divisions).where(eq(divisions.id, Number(c.req.param('id'))))
  return c.json({ ok: true })
})

authed.get('/representatives', async (c) => {
  const db = getDb()
  const divisionId = c.req.query('divisionId')
  const rows = divisionId
    ? await db
        .select()
        .from(representatives)
        .where(eq(representatives.divisionId, Number(divisionId)))
    : await db.select().from(representatives)
  return c.json(
    rows.map((r) => ({
      ...r,
      passwordHash: undefined,
    }))
  )
})

authed.post('/representatives', requireAdmin, async (c) => {
  const db = getDb()
  const body = await c.req.json<{
    surname: string
    name: string
    lastName: string
    mobile: string
    constituencyId: number
    divisionId: number
    isActive?: boolean
  }>()
  const [setting] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, 'maxRepsPerDivision'))
    .limit(1)
  const maxReps = Number(setting?.value ?? 10)
  const existingReps = await db
    .select()
    .from(representatives)
    .where(
      and(
        eq(representatives.divisionId, body.divisionId),
        eq(representatives.role, 'representative')
      )
    )
  if (existingReps.length >= maxReps) {
    return c.json({ error: `Maximum ${maxReps} representatives per division` }, 400)
  }
  const [constituency] = await db
    .select()
    .from(constituencies)
    .where(eq(constituencies.id, body.constituencyId))
    .limit(1)
  const [division] = await db
    .select()
    .from(divisions)
    .where(eq(divisions.id, body.divisionId))
    .limit(1)
  if (!constituency || !division) {
    return c.json({ error: 'Invalid constituency or division' }, 400)
  }
  const repNumber = existingReps.length + 1
  const username = generateUsername(
    constituency.corporation,
    division.divisionNumber,
    repNumber
  )
  const plainPassword = generatePassword()
  const [row] = await db
    .insert(representatives)
    .values({
      ...body,
      username,
      passwordHash: await hashPassword(plainPassword),
      role: 'representative',
      repNumber,
      isActive: body.isActive ?? true,
    })
    .returning()
  return c.json({
    representative: { ...row, passwordHash: undefined },
    credentials: { username, password: plainPassword },
  })
})

authed.post('/representatives/:id/reset-device', requireAdmin, async (c) => {
  const db = getDb()
  await db
    .update(representatives)
    .set({ boundDeviceId: null, deviceBoundAt: null })
    .where(eq(representatives.id, Number(c.req.param('id'))))
  return c.json({ ok: true })
})

authed.post('/representatives/:id/regenerate-password', requireAdmin, async (c) => {
  const db = getDb()
  const plainPassword = generatePassword()
  await db
    .update(representatives)
    .set({ passwordHash: await hashPassword(plainPassword) })
    .where(eq(representatives.id, Number(c.req.param('id'))))
  const [user] = await db
    .select()
    .from(representatives)
    .where(eq(representatives.id, Number(c.req.param('id'))))
    .limit(1)
  return c.json({
    username: user?.username,
    password: plainPassword,
  })
})

authed.delete('/representatives/:id', requireAdmin, async (c) => {
  const db = getDb()
  await db.delete(representatives).where(eq(representatives.id, Number(c.req.param('id'))))
  return c.json({ ok: true })
})

authed.get('/voters', async (c) => {
  const session = c.get('session')
  const db = getDb()
  const divisionId = c.req.query('divisionId')
  const since = c.req.query('since')
  const page = Number(c.req.query('page') ?? 0)
  const limit = Math.min(Number(c.req.query('limit') ?? 100), 500)
  let divId = divisionId ? Number(divisionId) : null
  if (session.role === 'representative') {
    divId = session.divisionId
  }
  if (!isValidDivisionId(divId)) {
    return c.json({ error: 'Division required' }, 400)
  }
  const conditions = [eq(voters.divisionId, divId!)]
  if (since) {
    conditions.push(gte(voters.updatedAt, since))
  }
  const rows = await db
    .select()
    .from(voters)
    .where(and(...conditions))
    .orderBy(desc(voters.updatedAt))
    .limit(limit)
    .offset(page * limit)
  return c.json(rows)
})

function isValidDivisionId(id: number | null): id is number {
  return id !== null && !Number.isNaN(id)
}

authed.post('/voters', async (c) => {
  const session = c.get('session')
  const db = getDb()
  const body = await c.req.json<Record<string, unknown>>()
  const divisionId =
    session.role === 'representative' ? session.divisionId! : Number(body.divisionId)
  try {
    const [row] = await db
      .insert(voters)
      .values({
        ...(body as typeof voters.$inferInsert),
        divisionId,
        enteredBy: session.userId,
        updatedAt: new Date().toISOString(),
      })
      .returning()
    await db.insert(auditLogs).values({
      representativeId: session.userId,
      action: 'voter_created',
      entityId: row.id,
      after: JSON.stringify(row),
    })
    return c.json(row)
  } catch (e: unknown) {
    if (String(e).includes('unique') || String(e).includes('duplicate')) {
      return c.json({ error: 'EPIC ID already exists' }, 409)
    }
    throw e
  }
})

authed.put('/voters/:id', async (c) => {
  const session = c.get('session')
  const db = getDb()
  const id = Number(c.req.param('id'))
  const [before] = await db.select().from(voters).where(eq(voters.id, id)).limit(1)
  if (!before) return c.json({ error: 'Not found' }, 404)
  if (
    session.role === 'representative' &&
    before.divisionId !== session.divisionId
  ) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  const body = await c.req.json<Partial<typeof voters.$inferInsert>>()
  const [row] = await db
    .update(voters)
    .set({ ...body, updatedAt: new Date().toISOString(), version: (before.version ?? 1) + 1 })
    .where(eq(voters.id, id))
    .returning()
  await db.insert(auditLogs).values({
    representativeId: session.userId,
    action: 'voter_updated',
    entityId: id,
    before: JSON.stringify(before),
    after: JSON.stringify(row),
  })
  return c.json(row)
})

authed.delete('/voters/:id', async (c) => {
  const session = c.get('session')
  const db = getDb()
  const id = Number(c.req.param('id'))
  const [before] = await db.select().from(voters).where(eq(voters.id, id)).limit(1)
  if (!before) return c.json({ error: 'Not found' }, 404)
  if (
    session.role === 'representative' &&
    before.divisionId !== session.divisionId
  ) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  await db.delete(voters).where(eq(voters.id, id))
  await db.insert(auditLogs).values({
    representativeId: session.userId,
    action: 'voter_deleted',
    entityId: id,
    before: JSON.stringify(before),
  })
  return c.json({ ok: true })
})

authed.post('/sync/push', async (c) => {
  const session = c.get('session')
  const db = getDb()
  const { items } = await c.req.json<{
    items: Array<{
      localId?: string
      serverId?: number
      operation: 'create' | 'update'
      payload: Record<string, unknown>
    }>
  }>()
  const results: Array<{ localId?: string; serverId: number; ok: boolean; error?: string }> =
    []
  for (const item of items ?? []) {
    try {
      if (item.operation === 'create' || !item.serverId) {
        const [row] = await db
          .insert(voters)
          .values({
            ...(item.payload as typeof voters.$inferInsert),
            enteredBy: session.userId,
            divisionId:
              session.role === 'representative'
                ? session.divisionId!
                : Number(item.payload.divisionId),
            updatedAt: new Date().toISOString(),
          })
          .returning()
        results.push({ localId: item.localId, serverId: row.id, ok: true })
      } else {
        const [row] = await db
          .update(voters)
          .set({
            ...(item.payload as Partial<typeof voters.$inferInsert>),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(voters.id, item.serverId))
          .returning()
        results.push({ localId: item.localId, serverId: row!.id, ok: true })
      }
    } catch (e) {
      results.push({
        localId: item.localId,
        serverId: item.serverId ?? 0,
        ok: false,
        error: String(e),
      })
    }
  }
  return c.json({ results })
})

authed.get('/sync/pull', async (c) => {
  const session = c.get('session')
  const db = getDb()
  const since = c.req.query('since') ?? '1970-01-01'
  const divId =
    session.role === 'representative'
      ? session.divisionId!
      : Number(c.req.query('divisionId'))
  const rows = await db
    .select()
    .from(voters)
    .where(and(eq(voters.divisionId, divId), gte(voters.updatedAt, since)))
    .orderBy(desc(voters.updatedAt))
    .limit(500)
  return c.json({ voters: rows, syncedAt: new Date().toISOString() })
})

authed.get('/analytics/summary', async (c) => {
  const db = getDb()
  const constituencyId = c.req.query('constituencyId')
  const divisionId = c.req.query('divisionId')
  let voterQuery = db.select({ count: sql<number>`count(*)::int` }).from(voters)
  if (divisionId) {
    voterQuery = voterQuery.where(eq(voters.divisionId, Number(divisionId))) as typeof voterQuery
  }
  const [voterCount] = await voterQuery
  const [divCount] = await db.select({ count: sql<number>`count(*)::int` }).from(divisions)
  const [repCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(representatives)
    .where(eq(representatives.role, 'representative'))
  const weekAgo = dayjs().subtract(7, 'day').toISOString()
  const [newVoters] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(voters)
    .where(gte(voters.createdAt, weekAgo))
  return c.json({
    totalVoters: voterCount?.count ?? 0,
    totalDivisions: divCount?.count ?? 0,
    totalReps: repCount?.count ?? 0,
    newVotersWeek: newVoters?.count ?? 0,
  })
})

authed.get('/analytics/by-division', async (c) => {
  const db = getDb()
  const rows = await db
    .select({
      divisionId: voters.divisionId,
      count: sql<number>`count(*)::int`,
    })
    .from(voters)
    .groupBy(voters.divisionId)
  return c.json(rows)
})

authed.get('/analytics/caste', async (c) => {
  const db = getDb()
  const divisionId = c.req.query('divisionId')
  const q = db
    .select({ caste: voters.caste, count: sql<number>`count(*)::int` })
    .from(voters)
    .groupBy(voters.caste)
  const rows = divisionId
    ? await q.where(eq(voters.divisionId, Number(divisionId)))
    : await q
  return c.json(rows)
})

authed.get('/audit-logs', requireAdmin, async (c) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.timestamp))
    .limit(200)
  return c.json(rows)
})

authed.post('/canvass', async (c) => {
  const session = c.get('session')
  const db = getDb()
  const body = await c.req.json<typeof canvassLogs.$inferInsert>()
  const [row] = await db
    .insert(canvassLogs)
    .values({ ...body, representativeId: session.userId })
    .returning()
  return c.json(row)
})

authed.get('/canvass/:voterId', async (c) => {
  const db = getDb()
  const rows = await db
    .select()
    .from(canvassLogs)
    .where(eq(canvassLogs.voterId, Number(c.req.param('voterId'))))
    .orderBy(desc(canvassLogs.date))
  return c.json(rows)
})

api.route('/', authed)

root.route('/api', api)

export default root
