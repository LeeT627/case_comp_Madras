'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { LOCATIONS, ROUTES } from '@/lib/constants'
import { fetchSessionUser } from '@/lib/gpaiAuth'

export default function LocationPage() {
  const [selectedLocation, setSelectedLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    checkExistingInfo()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkExistingInfo = async () => {
    try {
      // Gate via gpai session first
      try {
        await fetchSessionUser()
      } catch {
        router.push(ROUTES.SIGN_IN)
        return
      }

      // gpai 세션 확인 및 기존 참가자 정보 확인
      await fetchSessionUser()

      const res = await fetch('/api/participant-info', { method: 'GET' })
      const json = await res.json()

      if (json?.data?.location) {
        // 이미 위치가 저장된 경우 정보 입력 페이지로 이동
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
              Choose your competition location.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="location">Competition Location (or choose the closest one) *</Label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a location...</option>
                {LOCATIONS.map((location) => (
                  <option
                    key={location.value}
                    value={location.value}
                    disabled={!location.available}
                  >
                    {location.label} {!location.available && '(Coming Soon)'}
                  </option>
                ))}
              </select>
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
