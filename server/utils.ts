import bcrypt from 'bcryptjs'

export function generateCorpCode(corporation: string): string {
  const letters = corporation.replace(/[^a-zA-Z]/g, '')
  const code = letters.slice(0, 3)
  if (!code) return 'Org'
  return code.charAt(0).toUpperCase() + code.slice(1, 3).toLowerCase()
}

export function generateUsername(
  corporation: string,
  divisionNumber: string,
  repNumber: number
): string {
  return `${generateCorpCode(corporation)}${divisionNumber}R${repNumber}`
}

export function generatePassword(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
