'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HowToApplyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">How to Apply</h1>
          <Button onClick={() => router.push('/sign-in')} variant="outline">
            Back to Sign In
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Application Process</CardTitle>
              <CardDescription>
                Follow these steps to participate in the GPAI Case Competition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Step 1: Register on GPAI Platform</h3>
                <p className="text-gray-600 mb-2">
                  First, you must register on the main GPAI platform at{' '}
                  <a href="https://www.gpai.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    www.gpai.app
                  </a>
                </p>
                <p className="text-gray-600">
                  Use your school email address when registering on the GPAI platform.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Step 2: Create Competition Account</h3>
                <p className="text-gray-600">
                  After registering on GPAI, create a separate account for the case competition using the same school email address.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Step 3: Complete Your Profile</h3>
                <p className="text-gray-600">
                  Fill in your participant information including your location and college details.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Step 4: Submit Your Case Study</h3>
                <p className="text-gray-600 mb-2">
                  Upload your case study presentation in PDF, PPT, or PPTX format (max 20MB).
                </p>
                <p className="text-gray-600">
                  Deadline: 12th September, 2025 (IST)
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-800 mb-2">Important Note:</p>
                <p className="text-sm text-yellow-700">
                  Only users registered on the main GPAI platform can participate in the competition. 
                  Your competition account must use the same school email address as your GPAI account.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  onClick={() => window.open('https://www.gpai.app', '_blank')}
                  className="w-full"
                  variant="default"
                >
                  Go to GPAI Platform
                </Button>
                <Button 
                  onClick={() => router.push('/sign-up')}
                  className="w-full"
                  variant="outline"
                >
                  Create Competition Account
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                For any questions or assistance, please email:{' '}
                <a href="mailto:global@teamturing.com" className="text-blue-600 hover:text-blue-700">
                  global@teamturing.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}