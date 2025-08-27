'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { APP_NAME, APP_AUTHOR } from '@/lib/constants'
import { validateEmail } from '@/lib/email-validation'
import { loginWithPassword } from '@/lib/gpaiAuth'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true)
    try {
      // Decode the JWT to get user email
      const base64Url = credentialResponse.credential.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join('')
      )
      const { email } = JSON.parse(jsonPayload)

      // Call our API to verify against GPAI database
      const res = await fetch('/api/auth/google-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Google sign-in failed')
      }

      toast({ 
        title: 'Success!', 
        description: 'Signed in with Google successfully.' 
      })
      
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 500)
    } catch (error) {
      toast({
        title: 'Google Sign-In Failed',
        description: error instanceof Error ? error.message : 'Failed to sign in with Google',
        variant: 'destructive',
      })
    } finally {
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
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">{APP_NAME}</h1>
            <p className="text-lg text-gray-600 mt-1">{APP_AUTHOR}</p>
          </div>
          <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your GPAI registered email and password to access the competition
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
                <p className="text-xs text-gray-500">
                  Use the same email you registered with at www.gpai.app
                </p>
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
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    toast({
                      title: 'Google Sign-In Error',
                      description: 'Failed to sign in with Google',
                      variant: 'destructive',
                    })
                  }}
                  useOneTap
                  text="signin_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width="384"
                />
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
    </GoogleOAuthProvider>
  )
}
