import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env') })

export function isPlaceholderDatabaseUrl(url: string | undefined): boolean {
  if (!url?.trim()) return true
  return (
    url.includes('ep-xxx') ||
    url.includes('user:password@') ||
    url === 'postgresql://localhost'
  )
}

export function useLocalDatabase(): boolean {
  // PGlite does not work on Vercel serverless (read-only FS)
  if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
    return false
  }
  return process.env.USE_LOCAL_DB === 'true' || isPlaceholderDatabaseUrl(process.env.DATABASE_URL)
}
