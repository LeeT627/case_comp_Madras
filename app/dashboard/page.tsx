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

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [currentFileName, setCurrentFileName] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(ROUTES.SIGN_IN)
      } else {
        setUser(user)
      }
    } catch {
      // Error checking user
      router.push(ROUTES.SIGN_IN)
    }
  }


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
      
      if (!FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(fileExtension || '')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or PowerPoint file',
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
  }

  const handleUpload = async () => {
    if (!file || !user) return

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
        description: 'File uploaded successfully',
      })

      setCurrentFileName(file.name)
      setFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Submission</CardTitle>
              <CardDescription>
                Upload your case competition submission (PDF or PowerPoint, max 20MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>
              {file && (
                <div className="text-sm text-muted-foreground">
                  Selected: {file.name} ({formatFileSize(file.size)})
                </div>
              )}
              {currentFileName && !file && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Current Submission:</p>
                  <p className="text-sm text-green-700">{currentFileName}</p>
                </div>
              )}
              <Button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : currentFileName ? 'Replace Submission' : 'Upload Submission'}
              </Button>
              {currentFileName && (
                <p className="text-xs text-muted-foreground text-center">
                  ⚠️ Uploading a new file will replace your current submission
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competition Deadline</CardTitle>
              <CardDescription>
                Important dates and deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">Final Submission Deadline</p>
                    <p className="text-sm text-muted-foreground">Last date to submit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">TBD</p>
                    <p className="text-sm text-muted-foreground">To be announced</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}