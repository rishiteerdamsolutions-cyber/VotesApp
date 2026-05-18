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
