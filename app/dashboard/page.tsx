'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'
import { fetchSessionUser, logout as gpaiLogout } from '@/lib/gpaiAuth'

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

  useEffect(() => {
    const checkUserAndStatus = async () => {
      try {
        // gpai 세션 확인 및 유저 정보 확보
        const gpaiUser = await fetchSessionUser()
        setUser({ id: gpaiUser.id, email: gpaiUser.email })

        // 참가자 정보
        const infoRes = await fetch('/api/participant-info', { method: 'GET' })
        if (infoRes.status === 401) {
          router.push(ROUTES.SIGN_IN)
          return
        }
        const infoJson = await infoRes.json()

        // 업로드 파일 목록
        const listRes = await fetch('/api/uploads/list', { method: 'GET' })
        const listJson = await listRes.json()
        const firstFile: string | undefined = (listJson.files && listJson.files[0]) || undefined

        const status: SubmissionStatus = {
          hasParticipantInfo: !!infoJson.data,
          hasFileUploaded: !!firstFile,
          participantName: infoJson.data ? `${infoJson.data.first_name} ${infoJson.data.last_name}` : undefined,
          location: infoJson.data?.location,
          college: infoJson.data?.college === 'Other' ? infoJson.data?.college_other : infoJson.data?.college,
          fileName: firstFile ? firstFile.split('-').slice(1).join('-') : undefined,
          submittedAt: infoJson.data?.created_at,
        }

        setSubmissionStatus(status)
      } catch {
        // Error checking status
      } finally {
        setLoading(false)
      }
    }
    
    checkUserAndStatus()
  }, [router])

  const handleSignOut = async () => {
    try { await gpaiLogout() } catch {}
    router.push(ROUTES.SIGN_IN)
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
        <div className="flex justify-end mb-8">
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome to GPAI Case Competition</CardTitle>
              <CardDescription>
                {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="https://aggfpcxaxdyxiriqruos.supabase.co/storage/v1/object/public/public-files/case-competition-prompt.pdf" 
                download="GPAI Case Competition (TeamTuring) - Delhi.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Case Competition Prompt (PDF)
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Review the case study requirements and guidelines before preparing your submission.
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

          {/* Winnings & Deadline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Winnings & Deadline</CardTitle>
              <CardDescription>
                Winners will be announced after deadline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-gray-800 mb-2">Winnings: ₹120,000</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>1st: ₹30,000</p>
                  <p>2nd: ₹12,000</p>
                  <p>3rd: ₹7,000</p>
                  <p>4–10: ₹2,000 each → ₹14,000</p>
                  <p>11–50: ₹300 each → ₹12,000</p>
                  <p>51–500: ₹100 each → ₹45,000</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Take me back to: <a href="https://www.gpai.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">www.gpai.app</a>
              </p>
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700">Competition Deadline</p>
                <p className="text-xl font-bold text-red-600">12th September, 2025 (IST)</p>
                <div className="mt-4">
                  <Button onClick={() => router.push('/winners')} variant="default" className="w-full">
                    View competition results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
