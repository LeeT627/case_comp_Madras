'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { LOCATIONS, ROUTES } from '@/lib/constants'

export default function LocationPage() {
  const [selectedLocation, setSelectedLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    checkExistingInfo()
  }, [])

  const checkExistingInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(ROUTES.SIGN_IN)
        return
      }

      // Check if user already has participant info
      const { data } = await supabase
        .from('participant_info')
        .select('location')
        .eq('user_id', user.id)
        .single()

      if (data?.location) {
        // User already selected location, skip to information page
        router.push(ROUTES.DASHBOARD_INFORMATION)
      }
    } catch {
      // No existing data, continue
    } finally {
      setChecking(false)
    }
  }

  const handleContinue = async () => {
    if (!selectedLocation) {
      toast({
        title: 'Location Required',
        description: 'Please select a location to continue',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    
    // Store location in localStorage temporarily
    localStorage.setItem('selected_location', selectedLocation)
    
    // Navigate to information page
    router.push(ROUTES.DASHBOARD_INFORMATION)
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
            <span className="text-sm font-medium text-gray-700">Step 1 of 3</span>
            <span className="text-sm text-gray-500">Location Selection</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '33%' }}></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Select Your Location</CardTitle>
            <CardDescription>
              Choose your competition location. More locations will be available soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="location">Competition Location (or choose the closest one) *</Label>
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {LOCATIONS.map((location) => (
                  <div
                    key={location.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      location.available
                        ? selectedLocation === location.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => location.available && setSelectedLocation(location.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={location.value}
                          name="location"
                          value={location.value}
                          checked={selectedLocation === location.value}
                          onChange={() => setSelectedLocation(location.value)}
                          disabled={!location.available}
                          className="h-4 w-4 text-blue-600"
                        />
                        <label
                          htmlFor={location.value}
                          className={`font-medium ${
                            location.available ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {location.label}
                        </label>
                      </div>
                      {!location.available && (
                        <span className="text-xs text-gray-500">Coming Soon</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => router.push(ROUTES.DASHBOARD)}
              >
                Back
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selectedLocation || loading}
              >
                {loading ? 'Processing...' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}