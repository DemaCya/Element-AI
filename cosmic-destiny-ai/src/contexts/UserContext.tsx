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
    let mounted = true
    
    // 超时保护：2秒后强制结束loading
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('⚠️ User loading timeout, forcing loading=false')
        setLoading(false)
      }
    }, 2000)

    // 获取当前用户
    async function loadUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (!mounted) return
        
        if (error) {
          console.error('❌ Failed to get user:', error)
          setUser(null)
          setProfile(null)
          return
        }
        
        setUser(user)
        
        // 如果有用户，获取profile
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (!mounted) return
          
          if (profileError) {
            console.error('❌ Failed to get profile:', profileError)
          }
          
          setProfile(profileData || null)
        } else {
          setProfile(null)
        }
      } catch (error) {
        if (!mounted) return
        console.error('❌ Exception loading user:', error)
        setUser(null)
        setProfile(null)
      } finally {
        if (mounted) {
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