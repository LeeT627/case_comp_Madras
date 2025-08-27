'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      // Use Supabase Google auth
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account'
          }
        }
      })

      if (error) {
        throw error
      }
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

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google (GPAI Account)
              </Button>
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
