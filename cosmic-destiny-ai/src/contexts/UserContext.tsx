'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSupabase } from './SupabaseContext'
import { User } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface UserContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useSupabase()

  useEffect(() => {
    const getUser = async () => {
      console.log('🔍 UserContext: Starting getUser')
      try {
        console.log('🔍 UserContext: Calling supabase.auth.getUser()')
        const { data: { user }, error } = await supabase.auth.getUser()
        console.log('🔍 UserContext: getUser result:', { user: user?.id, error })
        setUser(user)

        if (user) {
          console.log('🔍 UserContext: Fetching profile for user:', user.id)
          // 获取用户profile信息
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError) {
            console.error('Error fetching profile:', profileError)
          } else {
            console.log('🔍 UserContext: Profile fetched:', profileData)
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        console.log('🔍 UserContext: Setting loading to false')
        setLoading(false)
      }
    }

    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('🔍 UserContext: Auth state change:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔍 UserContext: User signed in:', session.user.id)
          setUser(session.user)
          
          // 获取用户profile信息
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('Error fetching profile:', profileError)
          } else {
            console.log('🔍 UserContext: Profile fetched on sign in:', profileData)
            setProfile(profileData)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🔍 UserContext: User signed out')
          setUser(null)
          setProfile(null)
        }
        
        // 只在特定事件时设置loading为false
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          console.log('🔍 UserContext: Setting loading to false due to auth event:', event)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <UserContext.Provider value={{ user, profile, loading, signOut }}>
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