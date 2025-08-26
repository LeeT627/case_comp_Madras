import { NextRequest } from 'next/server'
import type { GpaiUser } from './gpaiTypes'
import { GPAI_API_BASE } from './gpaiClient'

export async function getUserFromRequest(request: NextRequest): Promise<GpaiUser | null> {
  try {
    const cookie = request.headers.get('cookie') ?? ''
    const res = await fetch(`${GPAI_API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: { Accept: 'application/json', Cookie: cookie },
    })
    if (!res.ok) return null
    const data = await res.json()
    return (data.user || data) as GpaiUser
  } catch {
    return null
  }
}
