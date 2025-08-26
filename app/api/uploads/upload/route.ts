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

    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    const fileName = `${Date.now()}-${file.name}`
    const path = `${user.id}/${fileName}`

    const supabase = createAdminClient()
    const arrayBuffer = await file.arrayBuffer()
    const { error } = await supabase.storage.from('uploads').upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

    if (error) return NextResponse.json({ error: 'Failed to upload' }, { status: 500 })

    return NextResponse.json({ ok: true, fileName: file.name })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

