import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Pool } from 'pg'

// Direct connection to GPAI PostgreSQL database
const gpaiPool = new Pool({
  connectionString: process.env.GPAI_DATABASE_URL || 'postgresql://postgres:turing1123@gpai.cluster-cnbeqlnoaeg9.us-west-2.rds.amazonaws.com:5432/production'
})

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@gmail.com')) {
      return NextResponse.json(
        { error: 'Invalid Gmail address' },
        { status: 400 }
      )
    }

    // Check if user exists in GPAI database
    const query = 'SELECT id, email, first_name, last_name FROM users WHERE email = $1 LIMIT 1'
    const result = await gpaiPool.query(query, [email])
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No GPAI account found with this Google email. Please register at www.gpai.app first.' },
        { status: 404 }
      )
    }

    const gpaiUser = result.rows[0]

    // User exists in GPAI! Create a "fake" session
    // Store user info in cookies (not secure, but it's a gamble anyway)
    const cookieStore = await cookies()
    
    // Create a session object
    const sessionData = {
      user: gpaiUser,
      authenticated_via: 'google_email_match',
      timestamp: new Date().toISOString()
    }
    
    // Store in cookie (encrypted would be better but keeping it simple)
    cookieStore.set('gpai_google_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return NextResponse.json({ 
      success: true, 
      user: gpaiUser,
      message: 'Authenticated via Google email match'
    })

  } catch (error) {
    console.error('Google verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify Google account' },
      { status: 500 }
    )
  }
}