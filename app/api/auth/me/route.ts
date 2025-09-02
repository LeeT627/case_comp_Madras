import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GPAI_API_URL = 'https://api-prod.gpai.app'

export async function GET(request: NextRequest) {
  try {
    // Get the sessionId cookie
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json({ 
        error: 'Not authenticated'
      }, { status: 401 })
    }

    // Check with GPAI API if the session is valid
    const res = await fetch(`${GPAI_API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sessionId=${sessionId}`,
      },
    })

    if (res.ok) {
      const userData = await res.json()
      return NextResponse.json(userData)
    } else {
      return NextResponse.json({ 
        error: 'Invalid session'
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Error checking authentication:', error)
    return NextResponse.json({ 
      error: 'Authentication check failed'
    }, { status: 500 })
  }
}