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

    const body = await request.json()
    const names = (body?.names as unknown) as string[] | undefined
    const name = (body?.name as unknown) as string | undefined

    const targets = names && names.length > 0 ? names : name ? [name] : []
    if (targets.length === 0) return NextResponse.json({ ok: true })

    const supabase = createAdminClient()
    const paths = targets.map((n) => `${user.id}/${n}`)
    const { error } = await supabase.storage.from('uploads').remove(paths)
    
    if (error) {
      console.error('[uploads/delete] Error:', error)
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

