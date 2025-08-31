import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    console.log('[Track Sign-in] Request received')
    const headersList = await headers()
    
    // Get tracking information
    const userAgent = headersList.get('user-agent') || null
    const referer = headersList.get('referer') || null
    const xForwardedFor = headersList.get('x-forwarded-for')
    const xRealIp = headersList.get('x-real-ip')
    const ip = xForwardedFor || xRealIp || request.ip || null
    
    // Get session ID from cookie if available
    const sessionId = request.cookies.get('sessionId')?.value || null
    
    // Get user ID if authenticated (from middleware)
    const userId = headersList.get('x-user-id') || null
    
    console.log('[Track Sign-in] Data:', {
      ip,
      userAgent: userAgent?.substring(0, 50),
      referer,
      sessionId,
      userId
    })
    
    const supabase = createAdminClient()
    
    // Insert tracking record
    const { data, error } = await supabase
      .from('signin_clicks')
      .insert({
        ip_address: ip,
        user_agent: userAgent,
        referrer: referer,
        session_id: sessionId,
        user_id: userId,
        clicked_at: new Date().toISOString()
      })
      .select()
    
    if (error) {
      console.error('[Track Sign-in] Failed to track sign-in click:', error)
      // Don't return error to client - tracking should be silent
    } else {
      console.log('[Track Sign-in] Successfully tracked click:', data)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('[Track Sign-in] Error:', error)
    // Don't return error to client - tracking should be silent
    return NextResponse.json({ success: true })
  }
}