'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/contexts/SupabaseContext'

export default function AuthCallback() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = useSupabase()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth?error=Authentication failed')
          return
        }

        if (data.session) {
          // Check if it's a new user
          const { data: { user } } = await supabase.auth.getUser()

          if (user) {
            // User profile will be created automatically by the database trigger
            router.push('/dashboard')
          }
        } else {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth?error=Authentication failed')
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Authenticating...</p>
        </div>
      </div>
    )
  }

  return null
}