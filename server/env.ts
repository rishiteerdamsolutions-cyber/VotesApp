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
  return process.env.USE_LOCAL_DB === 'true' || isPlaceholderDatabaseUrl(process.env.DATABASE_URL)
}
