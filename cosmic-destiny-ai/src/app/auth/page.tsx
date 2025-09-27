'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/auth/AuthForm'
import Navigation from '@/components/Navigation'

export default function AuthPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        // Dynamic import to avoid build-time errors
        const { createClient } = await import('@/lib/supabase/client')
        const client = createClient()
        setSupabase(client)
      } catch (error) {
        console.error('Error initializing Supabase:', error)
        setLoading(false)
      }
    }

    initializeSupabase()
  }, [])

  useEffect(() => {
    if (!supabase) return

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="cosmic-bg min-h-screen">
      <Navigation user={null} />

      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="w-full max-w-md">
          <AuthForm onSuccess={() => router.push('/dashboard')} />
        </div>
      </div>
    </div>
  )
}