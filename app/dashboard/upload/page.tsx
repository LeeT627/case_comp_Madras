'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { FILE_UPLOAD, ROUTES } from '@/lib/constants'

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
  const supabase = createClient()

  useEffect(() => {
    checkParticipantInfo()
  }, [])

  const checkParticipantInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(ROUTES.SIGN_IN)
        return
      }

      // Check if user has completed participant info
      const { data, error } = await supabase
        .from('participant_info')
        .select('first_name, last_name, location, college, college_other, reward_email')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        // No participant info, redirect to start
        toast({
          title: 'Complete Your Information',
          description: 'Please complete your participant information first',
          variant: 'destructive',
        })
        router.push(ROUTES.DASHBOARD_LOCATION)
        return
      }

      setParticipantInfo({
        first_name: data.first_name,
        last_name: data.last_name,
        location: data.location,
        college: data.college === 'Other' ? data.college_other : data.college,
        email: user.email || '',
        email_reward: data.reward_email || user.email || ''
      })

      // Check if user already uploaded a file
      const { data: files } = await supabase.storage
        .from('uploads')
        .list(user.id, {
          limit: 1,
          offset: 0,
        })

      if (files && files.length > 0) {
        setCurrentFileName(files[0].name.split('-').slice(1).join('-'))
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setDeleting(true)
    try {
      // Delete all existing files for this user
      const { data: existingFiles } = await supabase.storage
        .from('uploads')
        .list(user.id, {
          limit: 100,
          offset: 0,
        })

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`)
        await supabase.storage
          .from('uploads')
          .remove(filesToDelete)
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setUploading(true)
    try {
      // First, delete all existing files for this user
      const { data: existingFiles } = await supabase.storage
        .from('uploads')
        .list(user.id, {
          limit: 100,
          offset: 0,
        })

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`)
        await supabase.storage
          .from('uploads')
          .remove(filesToDelete)
      }

      // Now upload the new file
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
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

      // Redirect to dashboard after successful upload
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD)
      }, 2000)
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
              Upload your case study presentation (PDF or PowerPoint, max 20MB)
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