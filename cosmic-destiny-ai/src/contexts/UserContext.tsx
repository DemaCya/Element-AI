'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
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
    console.log('🔍 UserContext: Initializing...')
    let mounted = true
    let timeoutReached = false
    
    // 超时保护：10秒后强制结束loading
    const timeout = setTimeout(() => {
      if (mounted && !timeoutReached) {
        console.warn('⚠️ User loading timeout, forcing loading=false')
        timeoutReached = true
        setLoading(false)
      }
    }, 10000)

    // 获取当前用户
    async function loadUser() {
      try {
        console.log('📡 UserContext: Fetching user...')
        console.log('🔍 UserContext: Supabase client check', {
          hasSupabase: !!supabase,
          hasAuth: !!supabase?.auth,
          hasGetUser: typeof supabase?.auth?.getUser === 'function'
        })
        
        const startTime = Date.now()
        
        console.log('⏱️ UserContext: Calling supabase.auth.getUser()...')
        const result = await supabase.auth.getUser()
        console.log('⏱️ UserContext: supabase.auth.getUser() returned')
        
        const { data: { user }, error } = result
        
        const elapsed = Date.now() - startTime
        console.log(`📬 UserContext: User fetch completed in ${elapsed}ms`, { hasUser: !!user, hasError: !!error })
        
        if (!mounted) {
          console.log('🚫 UserContext: Component unmounted, ignoring results')
          return
        }
        
        if (error) {
          console.error('❌ UserContext: Failed to get user:', error)
          console.error('❌ UserContext: Error details:', JSON.stringify(error))
          setUser(null)
          setProfile(null)
          return
        }
        
        setUser(user)
        
        // 如果有用户，获取profile
        if (user) {
          console.log('👤 UserContext: User found, fetching profile for:', user.id)
          
          const profileStartTime = Date.now()
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          const profileElapsed = Date.now() - profileStartTime
          console.log(`📬 UserContext: Profile fetch completed in ${profileElapsed}ms`, { hasProfile: !!profileData, hasError: !!profileError })
          
          if (!mounted) {
            console.log('🚫 UserContext: Component unmounted after profile fetch')
            return
          }
          
          if (profileError) {
            console.error('❌ UserContext: Failed to get profile:', profileError)
            console.error('❌ UserContext: Profile error details:', JSON.stringify(profileError))
          }
          
          setProfile(profileData || null)
        } else {
          console.log('👤 UserContext: No user logged in')
          setProfile(null)
        }
      } catch (error) {
        if (!mounted) return
        console.error('❌ UserContext: Exception loading user:', error)
        console.error('❌ UserContext: Exception details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
        setUser(null)
        setProfile(null)
      } finally {
        if (mounted && !timeoutReached) {
          console.log('✅ UserContext: Loading complete')
          clearTimeout(timeout)
          setLoading(false)
        }
      }
    }

    loadUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
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
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <UserContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}