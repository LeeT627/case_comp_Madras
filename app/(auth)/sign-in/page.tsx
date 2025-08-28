'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_NAME, APP_AUTHOR } from '@/lib/constants'

export default function SignInPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Check if already authenticated
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  const checkAuth = async () => {
    try {
      const res = await fetch('https://api-prod.gpai.app/api/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (res.ok) {
        // Already authenticated, redirect to school email verification
        router.push('/verify-school-email')
      }
    } catch {
      // Not authenticated, stay on sign-in
    }
  }

  const handleSignIn = () => {
    // Redirect to main GPAI login with return URL to school email verification
    const returnUrl = encodeURIComponent('https://case-competition.gpai.app/verify-school-email')
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
