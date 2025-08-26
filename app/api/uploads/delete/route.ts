import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { GPAI_API_BASE } from '@/lib/gpaiClient'

export async function POST(request: NextRequest) {
  try {
    const hdrs = await headers()
    const cookie = hdrs.get('cookie') ?? ''
    const me = await fetch(`${GPAI_API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: { Accept: 'application/json', Cookie: cookie },
    })
    if (!me.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await me.json()

    const body = await request.json()
    const names = (body?.names as unknown) as string[] | undefined
    const name = (body?.name as unknown) as string | undefined

    const targets = names && names.length > 0 ? names : name ? [name] : []
    if (targets.length === 0) return NextResponse.json({ ok: true })

    const supabase = createAdminClient()
    const paths = targets.map((n) => `${user.id}/${n}`)
    const { error } = await supabase.storage.from('uploads').remove(paths)
    if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

