import { NextRequest, NextResponse } from 'next/server'
import { verifyGPAIUser, getGPAIUser } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists in GPAI database
    const exists = await verifyGPAIUser(email)
    
    if (!exists) {
      return NextResponse.json(
        { 
          verified: false, 
          message: 'You must be registered in the GPAI Competition to access this platform. Please sign up at the main GPAI website first.' 
        },
        { status: 403 }
      )
    }

    // Get user details if they exist
    const user = await getGPAIUser(email)
    
    return NextResponse.json({
      verified: true,
      user: user,
      message: 'User verified successfully'
    })
  } catch {
    // Error in verify-user route
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}