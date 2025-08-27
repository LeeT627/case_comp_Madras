import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchSessionUser } from '@/lib/gpaiAuth'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from GPAI
    const user = await fetchSessionUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    if (error) {
      console.error('[uploads/upload] Error:', error)
      return NextResponse.json({ error: 'Failed to upload' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, fileName: file.name })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

