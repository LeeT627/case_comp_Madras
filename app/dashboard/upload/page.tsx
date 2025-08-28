'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { FILE_UPLOAD, ROUTES } from '@/lib/constants'
import { fetchSessionUser } from '@/lib/gpaiAuth'

interface ParticipantInfo {
  first_name: string
  last_name: string
  location: string
  college: string
  email: string
  email_reward?: string
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentFileName, setCurrentFileName] = useState<string | null>(null)
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkParticipantInfo()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkParticipantInfo = async () => {
    try {
      // gpai 세션 확인
      const gpaiUser = await fetchSessionUser()

      // 참가자 정보 확인
      const infoRes = await fetch('/api/participant-info', { method: 'GET' })
      const info = await infoRes.json()
      if (!info?.data) {
        toast({
          title: 'Complete Your Information',
          description: 'Please complete your participant information first',
          variant: 'destructive',
        })
        router.push(ROUTES.DASHBOARD_LOCATION)
        return
      }

      setParticipantInfo({
        first_name: info.data.first_name,
        last_name: info.data.last_name,
        location: info.data.location,
        college: info.data.college === 'Other' ? info.data.college_other : info.data.college,
        email: gpaiUser.email || '',
        email_reward: info.data.reward_email || gpaiUser.email || ''
      })

      // 업로드 파일 확인
      const listRes = await fetch('/api/uploads/list', { method: 'GET' })
      const listJson = await listRes.json()
      if (Array.isArray(listJson.files) && listJson.files.length > 0) {
        const name = String(listJson.files[0])
        setCurrentFileName(name.split('-').slice(1).join('-'))
      }
    } catch {
      router.push(ROUTES.DASHBOARD_LOCATION)
    } finally {
      setChecking(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) {
      setFile(null)
      return
    }

    // Check file extension
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(fileExtension)) {
      toast({
        title: 'Invalid file type',
        description: `Please upload a ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(' or ')} file`,
        variant: 'destructive',
      })
      return
    }

    if (selectedFile.size > FILE_UPLOAD.MAX_SIZE) {
      toast({
        title: 'File too large',
        description: 'File size must be less than 20MB',
        variant: 'destructive',
      })
      return
    }

    setFile(selectedFile)
  }

  const handleDelete = async () => {
    if (!currentFileName) return

    setDeleting(true)
    try {
      // 서버에 삭제 요청 (전체 삭제)
      const listRes = await fetch('/api/uploads/list', { method: 'GET' })
      const listJson = await listRes.json()
      const files: string[] = Array.isArray(listJson.files) ? listJson.files : []
      if (files.length > 0) {
        await fetch('/api/uploads/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names: files }),
        })
      }

      toast({
        title: 'Success',
        description: 'Your submission has been deleted.',
      })

      setCurrentFileName(null)
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete file',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      // 기존 파일 삭제
      const listRes = await fetch('/api/uploads/list', { method: 'GET' })
      const listJson = await listRes.json()
      const files: string[] = Array.isArray(listJson.files) ? listJson.files : []
      if (files.length > 0) {
        await fetch('/api/uploads/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names: files }),
        })
      }

      // 업로드
      const form = new FormData()
      form.append('file', file)
      const uploadRes = await fetch('/api/uploads/upload', { method: 'POST', body: form })
      if (!uploadRes.ok) {
        const j = await uploadRes.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to upload file')
      }

      toast({
        title: 'Success',
        description: 'Your submission has been uploaded successfully!',
      })

      setCurrentFileName(file.name)
      setFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      // Redirect to submission complete page after successful upload
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD_SUBMISSION_COMPLETE)
      }, 1500)
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 3 of 3</span>
            <span className="text-sm text-gray-500">File Upload</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Participant Info Summary */}
        {participantInfo && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Submitting as</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">Name:</span>{' '}
                    <span className="font-medium">
                      {participantInfo.first_name} {participantInfo.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>{' '}
                    <span className="font-medium capitalize">{participantInfo.location}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">College:</span>{' '}
                  <span className="font-medium">{participantInfo.college}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email Address (Sign up):</span>{' '}
                  <span className="font-medium">{participantInfo.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email Address (Reward):</span>{' '}
                  <span className="font-medium">{participantInfo.email_reward}</span>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs"
                  onClick={() => router.push(ROUTES.DASHBOARD_INFORMATION)}
                >
                  Edit Information
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Upload Your Submission</CardTitle>
            <CardDescription>
              <span className="text-sm font-medium">You can re-upload before deadline (re-uploading will automatically overwrite previous submission)</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentFileName && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Current submission:</p>
                    <p>{currentFileName}</p>
                    <p className="text-xs mt-1">You can re-upload before deadline</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting || uploading}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <p className="text-xs text-gray-500">
                Accepted formats: PDF, PPT, PPTX (Maximum 20MB)
              </p>
            </div>

            {file && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm">
                <p className="font-medium text-blue-900">Selected file:</p>
                <p className="text-blue-700">{file.name}</p>
                <p className="text-xs text-blue-600 mt-1">Size: {formatFileSize(file.size)}</p>
              </div>
            )}

            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(ROUTES.DASHBOARD_INFORMATION)}
                disabled={uploading || deleting}
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(ROUTES.DASHBOARD)}
                  disabled={uploading || deleting}
                >
                  Submit Later
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading || deleting}
                >
                  {uploading ? 'Uploading...' : currentFileName ? 'Replace Submission' : 'Upload Submission'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
