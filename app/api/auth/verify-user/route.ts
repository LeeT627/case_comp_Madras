import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'This route has been removed' }, { status: 410 })
}
