'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
import { User } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'
import { logger } from '@/lib/logger'

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
    // 简单直接：获取当前用户
    async function loadUser() {
      try {
        logger.supabase('🔍 Loading user...')
        
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          logger.error('❌ Failed to get user:', error)
          setUser(null)
          setProfile(null)
        } else {
          setUser(user)
          
          // 如果有用户，获取profile
          if (user) {
            logger.supabase('👤 User found, fetching profile...')
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (profileError) {
              logger.error('❌ Failed to get profile:', profileError)
              setProfile(null)
            } else {
              logger.supabase('✅ Profile loaded')
              setProfile(profileData)
            }
          }
        }
      } catch (error) {
        logger.error('❌ Exception loading user:', error)
        setUser(null)
        setProfile(null)
      } finally {
        logger.supabase('✅ User loading complete')
        setLoading(false)
      }
    }

    loadUser()

    // 监听认证状态变化（登录/登出）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.supabase(`🔔 Auth event: ${event}`)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          
          // 获取profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setProfile(profileData || null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    try {
      logger.supabase('👋 Signing out...')
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      logger.error('❌ Sign out error:', error)
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