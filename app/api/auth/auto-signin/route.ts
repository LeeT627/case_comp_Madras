import { NextResponse } from 'next/server'

export async function POST() {
  // This endpoint has been removed.
  return NextResponse.json(
    { error: 'This endpoint has been removed' },
    { status: 410 }
  )
}
