import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from '../drizzle/schema'
import './env'
import { useLocalDatabase } from './env'

let dbInstance: ReturnType<typeof drizzleNeon<typeof schema>> | null = null

async function initPgliteLocal() {
  const { mkdirSync } = await import('fs')
  const { resolve } = await import('path')
  const { PGlite } = await import('@electric-sql/pglite')
  const { drizzle: drizzlePglite } = await import('drizzle-orm/pglite')
  const { migrate } = await import('drizzle-orm/pglite/migrator')
  const dataDir = resolve(process.cwd(), 'data', 'votermap-pg')
  mkdirSync(resolve(process.cwd(), 'data'), { recursive: true })
  const client = new PGlite(dataDir)
  const db = drizzlePglite(client, { schema })
  await migrate(db, { migrationsFolder: resolve(process.cwd(), 'drizzle/migrations') })
  return db as unknown as ReturnType<typeof drizzleNeon<typeof schema>>
}

export async function getDbAsync() {
  if (dbInstance) return dbInstance

  if (useLocalDatabase()) {
    dbInstance = await initPgliteLocal()
    console.log('[db] Using local PGlite')
    return dbInstance
  }

  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add your Neon connection string in Vercel Environment Variables.'
    )
  }
  const sql = neon(url)
  dbInstance = drizzleNeon(sql, { schema })
  console.log('[db] Using Neon PostgreSQL')
  return dbInstance
}

/** @deprecated use getDbAsync — sync getter for compatibility */
export function getDb() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call getDbAsync() first or await initDb().')
  }
  return dbInstance
}

export async function initDb() {
  return getDbAsync()
}

export type Db = Awaited<ReturnType<typeof getDbAsync>>
