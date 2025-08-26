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
                  You must currently be enrolled in any college or high school and <strong>have a campus email address</strong>.
                </li>
                <li className="text-gray-700">
                  Visit{' '}
                  <a href="https://www.gpai.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    www.gpai.app
                  </a>{' '}
                  and sign-up using your own school email. <strong>You must select "Continue with Email"</strong> (not Google or Apple sign-in). Any other email addresses such as @gmail.com will not be able to enter the competition.
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-red-600 mb-3">Important: Use "Continue with Email" option only!</p>
                    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-300">
                      <p className="text-center text-lg font-bold mb-2">Get Started for Free!</p>
                      <p className="text-center text-sm text-gray-600 mb-4">Sign up to unlock full features and save your history.</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center p-2 bg-gray-100 rounded opacity-50">
                          <span className="text-gray-500">🔍 Continue with Google</span>
                        </div>
                        <div className="flex items-center p-2 bg-gray-100 rounded opacity-50">
                          <span className="text-gray-500">🔍 Continue with Apple</span>
                        </div>
                        <p className="text-center text-xs text-gray-400 py-1">OR</p>
                        <div className="p-3 bg-red-500 text-white rounded text-center font-semibold relative">
                          Continue with Email
                          <span className="absolute -right-20 top-1/2 -translate-y-1/2 text-red-600 font-bold text-sm">
                            ← Must use this link
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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