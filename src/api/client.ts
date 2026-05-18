const API_BASE = import.meta.env.VITE_API_URL ?? ''

function getToken(): string | null {
  const raw = localStorage.getItem('voterMap_session')
  if (!raw) return null
  try {
    return JSON.parse(raw).token as string
  } catch {
    return null
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }
  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? res.statusText)
  }
  return data as T
}

export const apiGet = <T>(path: string) => api<T>(path)
export const apiPost = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body) })
export const apiPut = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'PUT', body: JSON.stringify(body) })
export const apiDelete = <T>(path: string) => api<T>(path, { method: 'DELETE' })
