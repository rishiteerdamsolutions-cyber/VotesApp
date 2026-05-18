import 'dotenv/config'
import { initDb } from '../server/db'

await initDb()
console.log('Database schema ready.')
