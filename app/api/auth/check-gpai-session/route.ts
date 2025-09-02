import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GPAI_API_URL = 'https://api-prod.gpai.app'

export async function GET(request: NextRequest) {
  try {
    // Get the sessionId cookie from the request
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('sessionId')?.value

    if (!sessionId) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'No session cookie found'
      }, { status: 200 })
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
      
      // Set the session cookie in our response so it persists
      const response = NextResponse.json({ 
        authenticated: true,
        user: userData,
        message: 'User authenticated with GPAI'
      })
      
      // Pass along the sessionId cookie
      response.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      
      return response
    } else {
      return NextResponse.json({ 
        authenticated: false,
        message: 'Invalid session or user not authenticated'
      }, { status: 200 })
    }
  } catch (error) {
    console.error('Error checking GPAI session:', error)
    return NextResponse.json({ 
      authenticated: false,
      message: 'Error checking authentication status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 })
  }
}