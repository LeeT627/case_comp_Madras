'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { APP_NAME, APP_AUTHOR, AUTH_MESSAGES } from '@/lib/constants'
import { validateEmail } from '@/lib/email-validation'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        setEmailSent(true)
        toast({
          title: 'Success - Check Your Email',
          description: `Password reset link has been sent to your email.\n\n⚠️ ${AUTH_MESSAGES.SPAM_FOLDER_WARNING}`,
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

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">{APP_NAME}</h1>
            <p className="text-lg text-gray-600 mt-1">{APP_AUTHOR}</p>
          </div>
          <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please check your email and click on the reset link to create a new password.
            </p>
            <p className="text-sm font-medium text-red-600">
              {AUTH_MESSAGES.SPAM_FOLDER_WARNING}
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/sign-in" className="w-full">
              <Button variant="outline" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </CardFooter>
        </Card>
        </div>
      </div>
    )
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
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a reset link
          </CardDescription>
          <p className="text-sm font-medium text-red-600 mt-2">
            {AUTH_MESSAGES.SCHOOL_EMAIL_WARNING}
          </p>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending reset link...' : 'Send reset link'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Remember your password?{' '}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              For help please email: <a href="mailto:global@teamturing.com" className="text-primary hover:underline">global@teamturing.com</a>
            </div>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  )
}