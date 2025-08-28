'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { validateEmail } from '@/lib/email-validation'
import { APP_NAME } from '@/lib/constants'

export default function VerifySchoolEmailPage() {
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [emailSent, setEmailSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkVerificationStatus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const checkVerificationStatus = async () => {
    try {
      const res = await fetch('/api/auth/check-school-email')
      
      if (res.ok) {
        const data = await res.json()
        if (data.verified) {
          // Already verified, redirect to dashboard
          router.push('/dashboard')
          return
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleSendVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    // Validate email
    const validation = validateEmail(email)
    if (!validation.isValid) {
      toast({
        title: 'Invalid Email',
        description: validation.error,
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school_email: email }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to send verification email')
      }

      toast({ 
        title: 'Verification Email Sent!', 
        description: 'Please check your inbox for the verification code.'
      })
      
      setEmailSent(true)
      setResendTimer(60) // 60 second cooldown for resending
      
    } catch (error) {
      toast({
        title: 'Failed to Send Email',
        description: error instanceof Error ? error.message : 'Failed to send verification email',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the 6-digit verification code',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: verificationCode,
          school_email: email 
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to verify code')
      }

      toast({ 
        title: 'Success!', 
        description: 'School email verified successfully.'
      })
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
      
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Invalid or expired code',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{APP_NAME}</h1>
          <p className="text-lg text-gray-600 mt-1">IIT Delhi BNC - ₹120,000</p>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Verify Your Student Status</CardTitle>
          </CardHeader>
          
          {!emailSent ? (
            <form onSubmit={handleSendVerification}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school-email">School Email Address *</Label>
                  <Input
                    id="school-email"
                    type="email"
                    placeholder="your.name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Must be a valid school email address (.edu, .ac, etc.)
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Why we need this:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• To verify your current student status</li>
                    <li>• To ensure eligibility for the competition</li>
                    <li>• To send competition-related communications</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !email}
                >
                  {loading ? 'Sending...' : 'Send Verification Email'}
                </Button>
                
                <div className="text-sm text-center text-muted-foreground">
                  For help please email: <a href="mailto:global@teamturing.com" className="text-primary hover:underline">global@teamturing.com</a>
                </div>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <CardContent className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    We've sent a verification code to:
                  </p>
                  <p className="font-medium text-gray-900">{email}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    disabled={loading}
                    className="text-center text-2xl font-bold tracking-wider"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Check your email for the 6-digit verification code
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setEmailSent(false)
                      setVerificationCode('')
                    }}
                  >
                    Change Email
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => handleSendVerification()}
                    disabled={resendTimer > 0}
                  >
                    {resendTimer > 0 
                      ? `Resend Code (${resendTimer}s)` 
                      : 'Resend Code'}
                  </Button>
                </div>
                
                <div className="text-sm text-center text-muted-foreground">
                  For help please email: <a href="mailto:global@teamturing.com" className="text-primary hover:underline">global@teamturing.com</a>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}