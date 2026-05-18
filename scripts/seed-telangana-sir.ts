/**
 * Seeds all 119 Telangana Assembly constituencies for SIR field work.
 * Divisions (BLO / polling parts) must still be added from CEO mapping sheets.
 *
 * Usage: npm run seed:telangana
 */
import '../server/env'
import { getDbAsync } from '../server/db'
import { seedTelanganaConstituencies } from '../server/seed-telangana'

const db = await getDbAsync()
const result = await seedTelanganaConstituencies(db)
console.log(result.message)
if (!result.skipped) {
  console.log('Next: Admin → Setup → select each AC and add Divisions (BLO areas / polling parts).')
}
