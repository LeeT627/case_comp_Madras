'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface UploadedFile {
  id: string
  name: string
  size: number
  created_at: string
  url: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchUploadedFiles()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/sign-in')
      } else {
        setUser(user)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/sign-in')
    }
  }

  const fetchUploadedFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .storage
        .from('uploads')
        .list(user.id, {
          limit: 100,
          offset: 0,
        })

      if (error) {
        console.error('Error fetching files:', error)
      } else if (data) {
        const filesWithUrls = await Promise.all(
          data.map(async (file) => {
            const { data: { publicUrl } } = supabase
              .storage
              .from('uploads')
              .getPublicUrl(`${user.id}/${file.name}`)
            
            return {
              id: file.id || file.name,
              name: file.name,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
              url: publicUrl,
            }
          })
        )
        setUploadedFiles(filesWithUrls)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
      const validExtensions = ['pdf', 'ppt', 'pptx']
      
      if (!validExtensions.includes(fileExtension || '')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or PowerPoint file',
          variant: 'destructive',
        })
        return
      }

      if (selectedFile.size > 20 * 1024 * 1024) {
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

      setFile(null)
      fetchUploadedFiles()
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
              <CardTitle>Upload File</CardTitle>
              <CardDescription>
                Upload PDF or PowerPoint files (max 20MB)
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
              <Button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deadline</CardTitle>
              <CardDescription>
                Important dates and deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">Submission Deadline</p>
                    <p className="text-sm text-muted-foreground">Final submission date</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">TBD</p>
                    <p className="text-sm text-muted-foreground">To be determined</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>
              Your previously uploaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading files...</p>
            ) : uploadedFiles.length === 0 ? (
              <p className="text-muted-foreground">No files uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {formatDate(file.created_at)}
                      </p>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}