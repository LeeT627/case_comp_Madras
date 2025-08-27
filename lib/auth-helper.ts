import { cookies, headers } from 'next/headers'
import { GPAI_API_BASE } from '@/lib/gpaiClient'

export async function getAuthenticatedUser() {
  const hdrs = await headers()
  const cookieStore = await cookies()
  
  // Check for Google OAuth session first
  const authMethod = cookieStore.get('auth_method')?.value
  const gpaiSession = cookieStore.get('gpai_session')?.value
  
  if (authMethod === 'google_oauth' && gpaiSession) {
    // Use our fake GPAI session from Google OAuth
    const user = JSON.parse(gpaiSession)
    return { user, isGoogleAuth: true }
  }
  
  // Try real GPAI authentication
  const cookie = hdrs.get('cookie') ?? ''
  const me = await fetch(`${GPAI_API_BASE}/api/auth/me`, {
    method: 'GET',
    headers: { Accept: 'application/json', Cookie: cookie },
  })
  
  if (!me.ok) {
    return { user: null, isGoogleAuth: false }
  }
  
  const user = await me.json()
  return { user, isGoogleAuth: false }
}