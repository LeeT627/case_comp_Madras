import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchSessionUser } from '@/lib/gpaiAuth'

export async function GET() {
  try {
    // Get authenticated user from GPAI
    const user = await fetchSessionUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.storage.from('uploads').list(user.id, { limit: 100, offset: 0 })
    if (error) return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })

    const files = (data ?? []).map((f) => f.name)
    return NextResponse.json({ files })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

