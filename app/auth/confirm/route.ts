import { NextResponse } from 'next/server'

export async function GET() {
  // Deprecated email confirmation route
  return NextResponse.json({ error: 'This route has been removed' }, { status: 410 })
}
