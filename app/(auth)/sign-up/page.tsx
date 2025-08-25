'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { APP_NAME, APP_AUTHOR, AUTH_MESSAGES, ROUTES } from '@/lib/constants'
import { validateEmail } from '@/lib/email-validation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email first
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      toast({
        title: 'Invalid Email',
        description: emailValidation.error,
        variant: 'destructive',
      })
      return
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    if (password.length < AUTH_MESSAGES.PASSWORD_MIN_LENGTH) {
      toast({
        title: 'Error',
        description: `Password must be at least ${AUTH_MESSAGES.PASSWORD_MIN_LENGTH} characters`,
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // First, verify user exists in GPAI database
      const verifyResponse = await fetch('/api/auth/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyData.verified) {
        toast({
          title: 'Registration Not Allowed',
          description: 'Only users registered in the GPAI Competition can create accounts. Please register at the main GPAI website first.',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      // If verified in GPAI database, create Supabase account
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            gpai_verified: true,
            gpai_user_id: verifyData.user?.id
          }
        },
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        // Check if email confirmation is required
        if (data.user && !data.session) {
          toast({
            title: 'Success - Check Your Email',
            description: 'Please check your email to verify your account.',
          })
          // Show additional warning about spam folder
          setTimeout(() => {
            toast({
              title: '⚠️ Important',
              description: AUTH_MESSAGES.SPAM_FOLDER_WARNING,
              variant: 'destructive',
            })
          }, 1000)
        } else if (data.session) {
          // Auto-login if email confirmation is disabled
          toast({
            title: 'Success',
            description: 'Account created successfully!',
          })
          router.push(ROUTES.DASHBOARD)
        } else {
          toast({
            title: 'Success',
            description: 'Account created! Please sign in.',
          })
        }
        router.push(ROUTES.SIGN_IN)
      }
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
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
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Only registered GPAI Competition participants can create accounts. Use your registered email address.
          </CardDescription>
          <p className="text-sm font-medium text-red-600 mt-2">
            {AUTH_MESSAGES.SCHOOL_EMAIL_WARNING}
          </p>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">School Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.name@school.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  // Real-time validation feedback
                  if (e.target.value) {
                    const validation = validateEmail(e.target.value)
                    if (!validation.isValid && e.target.value.includes('@')) {
                      // Only show error if they've typed an @ (indicating they're done typing domain)
                      toast({
                        title: 'Email Notice',
                        description: validation.error,
                        variant: 'destructive',
                      })
                    }
                  }
                }}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                ⚠️ Must be the same email used on www.gpai.app
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  )
}