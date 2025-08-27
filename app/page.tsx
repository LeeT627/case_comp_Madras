'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const GPAI_API_URL = 'https://api-prod.gpai.app'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  const checkAuth = async () => {
    try {
      const res = await fetch(`${GPAI_API_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (res.ok) {
        router.push('/dashboard')
      } else {
        router.push('/sign-in')
      }
    } catch {
      router.push('/sign-in')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  )
}
