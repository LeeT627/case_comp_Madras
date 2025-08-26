'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { COLLEGES, ROUTES } from '@/lib/constants'

interface ParticipantInfo {
  first_name: string
  last_name: string
  email_reward: string
  college: string
  college_other: string
}

export default function InformationPage() {
  const [formData, setFormData] = useState<ParticipantInfo>({
    first_name: '',
    last_name: '',
    email_reward: '',
    college: '',
    college_other: ''
  })
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [location, setLocation] = useState('')
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    checkLocationAndLoadData()
  }, [])

  const checkLocationAndLoadData = async () => {
    try {
      // Check if location was selected
      const selectedLocation = localStorage.getItem('selected_location')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(ROUTES.SIGN_IN)
        return
      }

      // Check if user already has participant info
      const { data } = await supabase
        .from('participant_info')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        // Load existing data
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email_reward: data.email_reward || '',
          college: data.college || '',
          college_other: data.college_other || ''
        })
        setLocation(data.location)
      } else if (!selectedLocation) {
        // No location selected, redirect back
        router.push(ROUTES.DASHBOARD_LOCATION)
        return
      } else {
        setLocation(selectedLocation)
      }
    } catch {
      // Error or no data, check for location
      const selectedLocation = localStorage.getItem('selected_location')
      if (!selectedLocation) {
        router.push(ROUTES.DASHBOARD_LOCATION)
        return
      }
      setLocation(selectedLocation)
    } finally {
      setChecking(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear college_other if not selecting "Other"
      ...(name === 'college' && value !== 'Other' ? { college_other: '' } : {})
    }))
  }

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      toast({
        title: 'First name is required',
        variant: 'destructive',
      })
      return false
    }
    if (!formData.last_name.trim()) {
      toast({
        title: 'Last name is required',
        variant: 'destructive',
      })
      return false
    }
    if (!formData.email_reward.trim()) {
      toast({
        title: 'Email address is required',
        variant: 'destructive',
      })
      return false
    }
    if (!formData.college) {
      toast({
        title: 'College selection is required',
        variant: 'destructive',
      })
      return false
    }
    if (formData.college === 'Other' && !formData.college_other.trim()) {
      toast({
        title: 'Please specify your college',
        variant: 'destructive',
      })
      return false
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email_reward)) {
      toast({
        title: 'Invalid email format',
        variant: 'destructive',
      })
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user')
      }

      // Check if record exists
      const { data: existing } = await supabase
        .from('participant_info')
        .select('id')
        .eq('user_id', user.id)
        .single()

      const participantData = {
        user_id: user.id,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email_reward: formData.email_reward.trim(),
        location: location,
        college: formData.college,
        college_other: formData.college === 'Other' ? formData.college_other.trim() : null
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('participant_info')
          .update(participantData)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase
          .from('participant_info')
          .insert(participantData)

        if (error) throw error
      }

      // Clear localStorage
      localStorage.removeItem('selected_location')
      
      toast({
        title: 'Success',
        description: 'Information saved successfully',
      })
      
      // Navigate to upload page
      router.push(ROUTES.DASHBOARD_UPLOAD)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save information',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 2 of 3</span>
            <span className="text-sm text-gray-500">Participant Information</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Participant Information</CardTitle>
            <CardDescription>
              Please provide your information for reward delivery. All fields are mandatory.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_reward">Email Address for Rewards *</Label>
                <Input
                  id="email_reward"
                  name="email_reward"
                  type="email"
                  value={formData.email_reward}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  This email will be used to send your rewards if you win
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="college">College/University *</Label>
                <select
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                  disabled={loading}
                >
                  <option value="">Select your college</option>
                  {COLLEGES.map((college) => (
                    <option key={college} value={college}>
                      {college}
                    </option>
                  ))}
                </select>
              </div>

              {formData.college === 'Other' && (
                <div className="space-y-2">
                  <Label htmlFor="college_other">Specify Your College *</Label>
                  <Input
                    id="college_other"
                    name="college_other"
                    type="text"
                    value={formData.college_other}
                    onChange={handleInputChange}
                    placeholder="Enter your college name"
                    required
                    disabled={loading}
                  />
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(ROUTES.DASHBOARD_LOCATION)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save & Continue'}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}