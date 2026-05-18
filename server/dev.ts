import './env'
import { serve } from '@hono/node-server'
import { initDb } from './db'
import { useLocalDatabase } from './env'

const port = Number(process.env.PORT ?? 3001)

await initDb()
if (useLocalDatabase()) {
  console.log('[db] Local PGlite — replace DATABASE_URL with Neon when ready for production')
}

const { default: app } = await import('./app')
console.log(`API server http://localhost:${port}`)

const server = serve({ fetch: app.fetch, port })
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${port} is already in use. Run: npm run dev:kill-ports\nThen: npm run dev\n`
    )
    process.exit(1)
  }
  throw err
})
