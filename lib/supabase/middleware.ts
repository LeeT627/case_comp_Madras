// Deprecated: Supabase middleware removed.
import { NextResponse } from 'next/server'

export async function updateSession() {
  return NextResponse.next()
}
