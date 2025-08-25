'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ROUTES } from '@/lib/constants'

interface SubmissionStatus {
  hasParticipantInfo: boolean
  hasFileUploaded: boolean
  participantName?: string
  fileName?: string
  location?: string
  college?: string
  submittedAt?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({
    hasParticipantInfo: false,
    hasFileUploaded: false
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    checkUserAndStatus()
  }, [])

  const checkUserAndStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(ROUTES.SIGN_IN)
        return
      }
      
      setUser(user)

      // Check participant info
      const { data: participantInfo } = await supabase
        .from('participant_info')
        .select('first_name, last_name, location, college, college_other, created_at')
        .eq('user_id', user.id)
        .single()

      // Check uploaded files
      const { data: files } = await supabase.storage
        .from('uploads')
        .list(user.id, {
          limit: 1,
          offset: 0,
        })

      const status: SubmissionStatus = {
        hasParticipantInfo: !!participantInfo,
        hasFileUploaded: files ? files.length > 0 : false,
        participantName: participantInfo ? `${participantInfo.first_name} ${participantInfo.last_name}` : undefined,
        location: participantInfo?.location,
        college: participantInfo?.college === 'Other' ? participantInfo.college_other : participantInfo?.college,
        fileName: files && files.length > 0 ? files[0].name.split('-').slice(1).join('-') : undefined,
        submittedAt: participantInfo?.created_at
      }

      setSubmissionStatus(status)
    } catch {
      // Error checking status
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(ROUTES.SIGN_IN)
  }

  const handleStartSubmission = () => {
    if (!submissionStatus.hasParticipantInfo) {
      router.push(ROUTES.DASHBOARD_LOCATION)
    } else {
      router.push(ROUTES.DASHBOARD_UPLOAD)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to GPAI Case Competition</CardTitle>
              <CardDescription>
                {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Submit your case study presentation for the GPAI Competition. Follow the steps below to complete your submission.
              </p>
            </CardContent>
          </Card>

          {/* Submission Status */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Status</CardTitle>
              <CardDescription>
                Track your submission progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Indicators */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      submissionStatus.hasParticipantInfo ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {submissionStatus.hasParticipantInfo && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Participant Information</p>
                      {submissionStatus.hasParticipantInfo && (
                        <p className="text-sm text-gray-500">
                          {submissionStatus.participantName} • {submissionStatus.college}
                        </p>
                      )}
                    </div>
                  </div>
                  {submissionStatus.hasParticipantInfo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(ROUTES.DASHBOARD_INFORMATION)}
                    >
                      Edit
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      submissionStatus.hasFileUploaded ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {submissionStatus.hasFileUploaded && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">File Upload</p>
                      {submissionStatus.hasFileUploaded && submissionStatus.fileName && (
                        <p className="text-sm text-gray-500">{submissionStatus.fileName}</p>
                      )}
                    </div>
                  </div>
                  {submissionStatus.hasFileUploaded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(ROUTES.DASHBOARD_UPLOAD)}
                    >
                      Replace
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                {!submissionStatus.hasParticipantInfo ? (
                  <Button 
                    onClick={() => router.push(ROUTES.DASHBOARD_LOCATION)}
                    className="w-full"
                    size="lg"
                  >
                    Start Submission
                  </Button>
                ) : !submissionStatus.hasFileUploaded ? (
                  <Button 
                    onClick={() => router.push(ROUTES.DASHBOARD_UPLOAD)}
                    className="w-full"
                    size="lg"
                  >
                    Upload Your File
                  </Button>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full mb-3">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-green-700">Submission Complete!</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your case study has been successfully submitted.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deadline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Deadline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">January 31, 2025</p>
              <p className="text-sm text-gray-600 mt-1">Make sure to submit before the deadline</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}