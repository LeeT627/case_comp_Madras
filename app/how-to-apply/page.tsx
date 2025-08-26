'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HowToApplyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-end mb-8">
          <Button onClick={() => router.push('/sign-in')} variant="outline">
            Back to Sign In
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">How to Apply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ol className="space-y-4 list-decimal pl-6">
                <li className="text-gray-700">
                  You must currently be enrolled in any college or high school.
                </li>
                <li className="text-gray-700">
                  Visit{' '}
                  <a href="https://www.gpai.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    www.gpai.app
                  </a>{' '}
                  and sign-up using your own school email (any other email addresses such as @gmail.com will not be able to enter the competition).
                </li>
                <li className="text-gray-700">
                  Enter Contest tab on the left panel. You will be redirected to the competition page.
                </li>
                <li className="text-gray-700">
                  You must create a separate account for the competition page. You must use the identical school email that you used for{' '}
                  <a href="https://www.gpai.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    www.gpai.app
                  </a>{' '}
                  to enter the competition.
                </li>
                <li className="text-gray-700">
                  Submit your deck to the competition portal by deadline.
                </li>
              </ol>
              
              <div className="mt-4">
                <p className="text-gray-700 font-medium">Total Winnings: ₹120,000</p>
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