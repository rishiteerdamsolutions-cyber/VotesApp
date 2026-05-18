import { sql } from 'drizzle-orm'
import type { Db } from './db'
import { constituencies, settings } from '../drizzle/schema'
import { getAssemblyConstituencies } from './sir-data'

export async function seedTelanganaConstituencies(db: Db) {
  const acs = getAssemblyConstituencies()
  const prefixed = await db
    .select({ id: constituencies.id })
    .from(constituencies)
    .where(sql`${constituencies.name} like 'AC %'`)
    .limit(1)

  if (prefixed.length) {
    return { inserted: 0, skipped: true, message: 'Telangana ACs already seeded.' }
  }

  for (const ac of acs) {
    await db.insert(constituencies).values({
      name: ac.displayName,
      corporation: ac.corporation,
      city: ac.city,
    })
  }

  const sirSettings: Record<string, string> = {
    sirState: 'Telangana',
    sirPhase: 'Phase-3',
    sirEnumerationStart: '2026-06-25',
    sirEnumerationEnd: '2026-07-24',
    sirDraftRollDate: '2026-07-31',
    sirFinalRollDate: '2026-10-01',
  }

  for (const [key, value] of Object.entries(sirSettings)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } })
  }

  return {
    inserted: acs.length,
    skipped: false,
    message: `Seeded ${acs.length} Assembly constituencies.`,
  }
}
