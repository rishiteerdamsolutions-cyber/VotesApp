/**
 * Run: DATABASE_URL=... npx tsx scripts/reset-admin-password.ts
 * Sets admin user password to ADMIN_DEFAULT_PASSWORD or 1KTR@1
 */
import { eq } from 'drizzle-orm'
import { getDb } from '../server/db'
import { representatives } from '../drizzle/schema'
import { hashPassword } from '../server/utils'

const password = process.env.ADMIN_DEFAULT_PASSWORD ?? '1KTR@1'

async function main() {
  const db = getDb()
  const hash = await hashPassword(password)
  const result = await db
    .update(representatives)
    .set({ passwordHash: hash })
    .where(eq(representatives.username, 'admin'))
    .returning({ id: representatives.id })
  if (!result.length) {
    console.error('No admin user found. Run setup at /setup-admin first.')
    process.exit(1)
  }
  console.log('Admin password updated. Username: admin')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
