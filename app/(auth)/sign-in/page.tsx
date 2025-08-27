'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { APP_NAME, APP_AUTHOR } from '@/lib/constants'
import { validateEmail } from '@/lib/email-validation'
import { loginWithPassword } from '@/lib/gpaiAuth'

interface CredentialResponse {
  credential: string
}

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: '1041422533141-6b7nc9q5nl4hpgpt48qehh1435flt806.apps.googleusercontent.com',
          callback: handleGoogleCallback,
          auto_select: false
        })
        
        // Render the button
        const buttonDiv = document.getElementById('google-signin-button')
        if (buttonDiv) {
          window.google.accounts.id.renderButton(buttonDiv, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 384
          })
        }
        
        setGoogleLoaded(true)
      }
    }
    
    script.onerror = () => {
      console.error('Failed to load Google Sign-In script')
      setGoogleLoaded(true)
    }
    
    document.body.appendChild(script)
    
    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoogleCallback = async (response: CredentialResponse) => {
    setLoading(true)
    try {
      // Send credential to our API
      const res = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Google sign-in failed')
      }

      const data = await res.json()
      
      toast({ 
        title: 'Success!', 
        description: data.message || 'Signed in with Google successfully.'
      })
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 500)
      
    } catch (error) {
      toast({
        title: 'Google Sign-In Failed',
        description: error instanceof Error ? error.message : 'Failed to sign in with Google',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      toast({
        title: 'Invalid Email',
        description: emailValidation.error,
        variant: 'destructive',
      })
      return
    }

    if (!password || password.length < 6) {
      toast({
        title: 'Invalid Password',
        description: 'Please enter your password (min 6 characters).',
        variant: 'destructive',
      })
      return
    }
    
    setLoading(true)

    try {
      await loginWithPassword(email, password)
      toast({ title: 'Success!', description: 'Signed in successfully.' })
      
      // Use window.location for more reliable redirect
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 500)
    } catch (error) {
      let errorTitle = 'Error'
      let errorMessage = 'Sign in failed. Please try again.'
      
      const apiError = error as { status?: number; body?: unknown; message?: string }
      
      if (apiError.status === 401) {
        // Unauthorized - wrong credentials or not registered
        errorTitle = 'Authentication Failed'
        errorMessage = 'Incorrect email or password. Please check your credentials and try again.'
        
        // Check if the error body has more specific info
        if (apiError.body && typeof apiError.body === 'object') {
          const errorBody = apiError.body as { message?: string; error?: string }
          if (errorBody.message?.includes('not found') || errorBody.error?.includes('not found')) {
            errorTitle = 'Account Not Found'
            errorMessage = 'Please register on www.gpai.app first to get started.'
          }
        }
      } else if (apiError.status === 404) {
        // User not found
        errorTitle = 'Account Not Found'
        errorMessage = 'Please register on www.gpai.app first to get started.'
      } else if (apiError.status && apiError.status >= 500) {
        // Server error
        errorTitle = 'Server Error'
        errorMessage = 'Failed to connect to GPAI servers. Please try again later.'
      } else if (apiError.message?.includes('fetch')) {
        // Network error
        errorTitle = 'Connection Error'
        errorMessage = 'Failed to connect to the server. Please check your internet connection.'
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
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
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">School Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              
              <div className="w-full">
                <div id="google-signin-button" className="w-full flex justify-center"></div>
              </div>
              
              <div className="text-sm text-center text-muted-foreground">
                For help please email: <a href="mailto:global@teamturing.com" className="text-primary hover:underline">global@teamturing.com</a>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/how-to-apply')}
              >
                How do I apply?
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
