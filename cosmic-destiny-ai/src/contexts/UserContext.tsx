'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'

interface UserContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      const getUser = async () => {
        try {
          // Check for mock user first (for testing)
          const mockUserStr = localStorage.getItem('mockUser')
          if (mockUserStr) {
            const mockUser = JSON.parse(mockUserStr)
            setUser(mockUser)
            setLoading(false)
            return
          }

          // Dynamic import to avoid build-time errors
          const { createClient } = await import('@/lib/supabase/client')
          const client = createClient()

          const { data: { user: authUser } } = await client.auth.getUser()

          if (authUser) {
            // Get user profile
            const { data: profile } = await client
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single()

            setUser({
              id: authUser.id,
              email: authUser.email!,
              createdAt: authUser.created_at!,
              profile: profile ? {
                fullName: profile.full_name,
                avatarUrl: profile.avatar_url
              } : undefined
            })
          }
        } catch (error) {
          console.error('Error getting user:', error)
        } finally {
          setLoading(false)
        }
      }

      getUser()
    } else {
      setLoading(false)
    }
  }, [])

  const signOut = async () => {
    try {
      // Clear mock user if exists
      localStorage.removeItem('mockUser')

      // Dynamic import to avoid build-time errors
      const { createClient } = await import('@/lib/supabase/client')
      const client = createClient()

      await client.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
      setUser(null)
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}