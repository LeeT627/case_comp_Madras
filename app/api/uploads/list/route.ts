import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { GPAI_API_BASE } from '@/lib/gpaiClient'

export async function GET() {
  try {
    const hdrs = await headers()
    const cookie = hdrs.get('cookie') ?? ''
    const me = await fetch(`${GPAI_API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: { Accept: 'application/json', Cookie: cookie },
    })
    if (!me.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await me.json()

    const supabase = createAdminClient()
    const { data, error } = await supabase.storage.from('uploads').list(user.id, { limit: 100, offset: 0 })
    if (error) return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })

    const files = (data ?? []).map((f) => f.name)
    return NextResponse.json({ files })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

