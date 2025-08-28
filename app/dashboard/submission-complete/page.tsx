'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { fetchSessionUser } from '@/lib/gpaiAuth'

export default function SubmissionCompletePage() {
  const router = useRouter()

  useEffect(() => {
    // Verify user is authenticated
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      await fetchSessionUser()
    } catch {
      router.push(ROUTES.SIGN_IN)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Indicator - Complete */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Completed</span>
            <span className="text-sm text-gray-500">Submission Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Submission Complete!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your entry has been successfully submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed">
                Thank you for participating in the GPAI Case Competition! 
                We appreciate your submission and the effort you&apos;ve put into this challenge.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                Competition results will be announced after the deadline and sent directly 
                to your verified school email address. Winners will receive their prizes 
                according to the competition guidelines.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                onClick={() => router.push(ROUTES.DASHBOARD)}
                className="w-full"
              >
                Return to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push(ROUTES.DASHBOARD_UPLOAD)}
                className="w-full"
              >
                Submit Another File
              </Button>
            </div>

            <div className="text-sm text-gray-500 pt-4 border-top">
              <p>For any questions, please contact:</p>
              <a href="mailto:global@teamturing.com" className="text-primary hover:underline">
                global@teamturing.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}