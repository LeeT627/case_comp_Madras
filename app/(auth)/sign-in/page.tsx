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

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
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
          description: verifyData.message || 'You must be registered in the GPAI Competition to access this platform.',
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
        router.push('/dashboard')
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

  const handleMagicLink = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
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
          description: 'Only registered GPAI Competition participants can access this platform.',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      // Send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        // If error, try to create account first
        if (error.message.includes('User not found')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password: Math.random().toString(36).slice(-12), // Random password since we'll use magic link
            options: {
              emailRedirectTo: `${window.location.origin}/dashboard`,
            },
          })
          
          if (!signUpError) {
            setMagicLinkSent(true)
            toast({
              title: 'Account Created!',
              description: 'Check your email for the login link.',
            })
          } else {
            toast({
              title: 'Error',
              description: signUpError.message,
              variant: 'destructive',
            })
          }
        } else {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          })
        }
      } else {
        setMagicLinkSent(true)
        toast({
          title: 'Magic Link Sent!',
          description: 'Check your email for the login link.',
        })
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

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a login link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in your email to sign in. 
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              ⚠️ Please check your spam folder if you don&apos;t see the email in your inbox.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setMagicLinkSent(false)}
            >
              Back to sign in
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">GPAI Competition - Sign In</CardTitle>
          <CardDescription>
            Use the same school email address registered on www.gpai.app
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
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button 
              type="button"
              variant="outline" 
              className="w-full" 
              disabled={loading || !email}
              onClick={handleMagicLink}
            >
              {loading ? 'Sending...' : 'Send Magic Link (No Password Required)'}
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
  )
}