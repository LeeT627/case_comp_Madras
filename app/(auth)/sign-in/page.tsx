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

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
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
          title: 'Access Denied',
          description: verifyData.message || AUTH_MESSAGES.ACCESS_DENIED,
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      // If verified in GPAI database, proceed with Supabase authentication
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // If sign in fails, it might be because they haven't created an account yet
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'First Time Login',
            description: 'Please sign up first to create your account, or use Magic Link below.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'Success',
          description: 'Signed in successfully!',
        })
        router.push(ROUTES.DASHBOARD)
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
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <p className="text-sm font-medium text-red-600 mt-2">
            {AUTH_MESSAGES.SCHOOL_EMAIL_WARNING}
          </p>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="text-sm">
              <Link href="/reset-password" className="text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  )
}