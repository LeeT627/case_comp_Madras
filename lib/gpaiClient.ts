export const GPAI_API_BASE = process.env.NEXT_PUBLIC_GPAI_API_BASE ?? 'https://api-prod.gpai.app'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function parseJsonSafe<T>(res: Response): Promise<T> {
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    throw new ApiError('Invalid JSON response', res.status, text)
  }
}

export async function getJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${GPAI_API_BASE}${path}`, {
    ...init,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
    credentials: 'include',
  })
  if (!res.ok) {
    let body: unknown
    try { body = await res.clone().json() } catch { body = undefined }
    throw new ApiError('Request failed', res.status, body)
  }
  return parseJsonSafe<T>(res)
}

export async function postJson<T, B extends object>(path: string, body: B, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${GPAI_API_BASE}${path}`, {
    ...init,
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) {
    let bodyJson: unknown
    try { bodyJson = await res.clone().json() } catch { bodyJson = undefined }
    throw new ApiError('Request failed', res.status, bodyJson)
  }
  return parseJsonSafe<T>(res)
}

