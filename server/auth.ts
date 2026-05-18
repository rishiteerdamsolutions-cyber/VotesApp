import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'votermap-dev-secret-change-in-production'
)

export interface SessionPayload {
  userId: number
  role: 'superadmin' | 'representative'
  divisionId: number | null
  constituencyId: number | null
  name: string
  username: string
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, SECRET)
  return payload as unknown as SessionPayload
}
