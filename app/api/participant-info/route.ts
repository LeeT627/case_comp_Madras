import { NextRequest, NextResponse } from 'next/server'
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

    console.log('[participant-info GET] User:', user)

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('participant_info')
      .select('first_name, last_name, location, college, college_other, reward_email, created_at')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to load participant info' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? null })
  } catch (e) {
    console.error('[participant-info GET] Error:', e)
    const errorMessage = e instanceof Error ? e.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

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

    const supabase = createAdminClient()
    const body = await request.json()
    const { first_name, last_name, reward_email, location, college, college_other } = body as Record<string, unknown>

    if (!first_name || !last_name || !reward_email || !location || !college) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const payload = {
      user_id: user.id as string,
      first_name: String(first_name),
      last_name: String(last_name),
      reward_email: String(reward_email),
      location: String(location),
      college: String(college),
      college_other: college_other ? String(college_other) : null,
    }

    const { error } = await supabase
      .from('participant_info')
      .upsert(payload, { onConflict: 'user_id' })
    console.log(error)

    if (error) {
      return NextResponse.json({ error: 'Failed to save participant info' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

