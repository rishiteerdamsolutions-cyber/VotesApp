import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite'
import { neon } from '@neondatabase/serverless'
import { PGlite } from '@electric-sql/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { mkdirSync } from 'fs'
import { resolve } from 'path'
import * as schema from '../drizzle/schema'
import './env'
import { useLocalDatabase } from './env'

let dbInstance: ReturnType<typeof drizzleNeon<typeof schema>> | null = null
let pgliteClient: PGlite | null = null
let schemaReady = false

async function ensurePgliteSchema(db: ReturnType<typeof drizzlePglite<typeof schema>>) {
  if (schemaReady) return
  await migrate(db, { migrationsFolder: resolve(process.cwd(), 'drizzle/migrations') })
  schemaReady = true
}

export async function getDbAsync() {
  if (dbInstance) return dbInstance

  if (useLocalDatabase()) {
    const dataDir = resolve(process.cwd(), 'data', 'votermap-pg')
    mkdirSync(resolve(process.cwd(), 'data'), { recursive: true })
    pgliteClient = new PGlite(dataDir)
    const db = drizzlePglite(pgliteClient, { schema })
    await ensurePgliteSchema(db)
    dbInstance = db as unknown as ReturnType<typeof drizzleNeon<typeof schema>>
    console.log('[db] Using local PGlite at', dataDir)
    return dbInstance
  }

  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. Add Neon URL to .env or set USE_LOCAL_DB=true')
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
