import type { GpaiUser } from './gpaiTypes'

// GPAI Auth API client
const GPAI_API_URL = 'https://api-prod.gpai.app'

export async function fetchSessionUser(): Promise<GpaiUser> {
  const response = await fetch(`${GPAI_API_URL}/api/auth/me`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Not authenticated')
  }

  return response.json()
}

export async function logout(): Promise<void> {
  const response = await fetch(`${GPAI_API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })

  if (!response.ok) {
    throw new Error('Logout failed')
  }
}

