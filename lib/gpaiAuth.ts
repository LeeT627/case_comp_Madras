import { getJson, postJson } from './gpaiClient'
import type { GpaiUser } from './gpaiTypes'

export interface PasswordLoginPayload {
  email: string
  password: string
}

export async function loginWithPassword(email: string, password: string): Promise<GpaiUser> {
  const payload: PasswordLoginPayload = {
    email,
    password,
  }
  const response = await postJson<{ user?: GpaiUser } & GpaiUser, PasswordLoginPayload>('/api/auth/login/password', payload)
  return response.user || response
}

export async function fetchSessionUser(): Promise<GpaiUser> {
  const response = await getJson<{ user?: GpaiUser } & GpaiUser>('/api/auth/me')
  return response.user || response
}

export async function logout(): Promise<void> {
  await postJson<unknown, Record<string, never>>('/api/auth/logout', {})
}

