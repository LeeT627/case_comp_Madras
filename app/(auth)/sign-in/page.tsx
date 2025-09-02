'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_NAME, APP_AUTHOR } from '@/lib/constants'

export default function SignInPage() {
  const router = useRouter()
  const [isPolling, setIsPolling] = useState(false)
  const [pollMessage, setPollMessage] = useState('')
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const authWindow = useRef<Window | null>(null)
  
  useEffect(() => {
    // Check if already authenticated
    checkAuth()
    
    // Cleanup polling on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check-gpai-session', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await res.json()
      
      if (data.authenticated) {
        // Already authenticated, redirect to school email verification
        router.push('/verify-school-email')
      }
    } catch {
      // Not authenticated, stay on sign-in
    }
  }

  const startPolling = () => {
    let pollCount = 0
    const maxPolls = 60 // Poll for max 3 minutes (60 * 3 seconds)
    
    pollingInterval.current = setInterval(async () => {
      pollCount++
      
      try {
        const res = await fetch('/api/auth/check-gpai-session', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        const data = await res.json()
        
        if (data.authenticated) {
          // Authentication successful!
          setIsPolling(false)
          setPollMessage('Authentication successful! Redirecting...')
          
          // Try to close the auth window
          if (authWindow.current && !authWindow.current.closed) {
            authWindow.current.close()
          }
          
          // Clear the interval
          if (pollingInterval.current) {
            clearInterval(pollingInterval.current)
          }
          
          // Redirect to email verification
          setTimeout(() => {
            router.push('/verify-school-email')
          }, 1000)
        } else if (pollCount >= maxPolls) {
          // Timeout - stop polling
          setIsPolling(false)
          setPollMessage('Authentication timeout. Please try again.')
          if (pollingInterval.current) {
            clearInterval(pollingInterval.current)
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 3000) // Poll every 3 seconds
  }

  const handleSignIn = async () => {
    // Track the sign-in click
    try {
      console.log('Tracking sign-in click...')
      const response = await fetch('/api/track-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('Tracking response:', response.ok)
    } catch (error) {
      console.error('Tracking error:', error)
      // Silent fail - don't block sign-in if tracking fails
    }
    
    // Open GPAI login in a new tab
    const returnUrl = encodeURIComponent(`${window.location.origin}/verify-school-email`)
    authWindow.current = window.open(
      `https://gpai.app/login?returnUrl=${returnUrl}`,
      '_blank'
    )
    
    // Start polling for authentication
    setIsPolling(true)
    setPollMessage('Please complete sign-in in the new tab...')
    startPolling()
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
              disabled={isPolling}
            >
              {isPolling ? 'Waiting for authentication...' : 'Sign in with GPAI Account'}
            </Button>
            
            {pollMessage && (
              <div className={`text-sm text-center p-3 rounded-lg ${
                pollMessage.includes('successful') 
                  ? 'bg-green-50 text-green-700' 
                  : pollMessage.includes('timeout') 
                    ? 'bg-red-50 text-red-700'
                    : 'bg-blue-50 text-blue-700'
              }`}>
                {pollMessage}
                {isPolling && (
                  <div className="mt-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mx-auto"></div>
                  </div>
                )}
              </div>
            )}
            
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
