import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    // Get user ID from middleware headers
    const hdrs = await headers()
    const userId = hdrs.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.storage.from('uploads').list(userId, { limit: 100, offset: 0 })
    
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

