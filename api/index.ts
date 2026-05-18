import '../server/env'
import { handle } from 'hono/vercel'
import app from '../server/app'

/** Node.js runtime (required for bcrypt + Neon) */
export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
}

export default handle(app)
