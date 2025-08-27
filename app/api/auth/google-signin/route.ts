import { NextResponse } from 'next/server'

// This route is no longer used - authentication is handled through main GPAI
// Keeping for backwards compatibility but redirecting to main auth
export async function POST(request: Request) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Please use the main GPAI authentication at gpai.app/login',
      redirectTo: 'https://gpai.app/login?returnUrl=' + encodeURIComponent('https://case-competition.gpai.app/dashboard')
    },
    { status: 410 } // 410 Gone
  )
}