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
    
    if (error) {
      // If folder doesn't exist, return empty array instead of error
      if (error.message?.includes('not found')) {
        return NextResponse.json({ files: [] })
      }
      console.error('[uploads/list] Error:', error)
      return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
    }

    const files = (data ?? []).map((f) => f.name)
    return NextResponse.json({ files })
  } catch (error) {
    console.error('[uploads/list] Catch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

