'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_NAME, APP_AUTHOR } from '@/lib/constants'
import { useEffect } from 'react'

export default function SignInPage() {
  const router = useRouter()

  // Check if user is already authenticated via middleware
  useEffect(() => {
    // Try to fetch dashboard - if successful, user is authenticated
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          router.push('/dashboard')
        }
      })
      .catch(() => {
        // Not authenticated, stay on sign-in
      })
  }, [router])

  const handleSignIn = async () => {
    // Track the sign-in click
    try {
      await fetch('/api/track-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Tracking error:', error)
      // Silent fail - don't block sign-in if tracking fails
    }
    
    // Redirect to GPAI login
    const returnUrl = encodeURIComponent(`${window.location.origin}/auth/callback`)
    window.location.href = `https://gpai.app/login?returnUrl=${returnUrl}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{APP_NAME}</h1>
          <p className="text-lg text-gray-600 mt-1">{APP_AUTHOR}</p>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription className="text-red-600 font-medium">
              Please sign in with your gpai.app credentials. If you do not have a gpai.app account, please sign up on gpai.app first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-8">
            <Button 
              onClick={handleSignIn} 
              className="w-full"
              size="lg"
            >
              Sign in with GPAI Account
            </Button>
            
            <div className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account? 
              <a 
                href="https://gpai.app/signup" 
                className="text-primary hover:underline font-medium ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sign up on gpai.app
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}