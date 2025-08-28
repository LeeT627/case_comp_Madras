'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { validateEmail } from '@/lib/email-validation'
import { APP_NAME } from '@/lib/constants'

export default function VerifySchoolEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkVerificationStatus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
      const res = await fetch('/api/auth/verify-school-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ school_email: email }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to verify email')
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
        description: error instanceof Error ? error.message : 'Failed to verify school email',
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
          <p className="text-lg text-gray-600 mt-1">Student Verification Required</p>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Verify Your Student Status</CardTitle>
            <CardDescription>
              Please provide your school email address to continue. This is required to verify that you are currently enrolled in an educational institution.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
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
                {loading ? 'Verifying...' : 'Verify School Email'}
              </Button>
              
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