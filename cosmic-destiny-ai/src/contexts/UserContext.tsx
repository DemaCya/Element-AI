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
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useSupabase()

  const refreshProfile = async () => {
    if (!user) {
      logger.info('UserContext: refreshProfile called but no user is logged in.')
      return
    }
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        logger.error('UserContext: Error refreshing profile:', profileError)
        // 即使profile查询失败，也不影响用户认证状态
        setProfile(null)
      } else {
        logger.info('UserContext: Profile refreshed successfully.')
        setProfile(profileData || null)
      }
    } catch (error) {
      logger.error('UserContext: Exception during profile refresh:', error)
      setProfile(null)
    }
  }


  useEffect(() => {
    const logPrefix = `[user-context-${Date.now()}]`
    logger.info(`${logPrefix} Initializing...`)
    let mounted = true
    
    // 简化的认证流程
    async function initializeAuth() {
      try {
        logger.info(`${logPrefix} 📡 Checking authentication...`)
        
        // 只使用getSession()，这是最快的检查方式
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) {
          logger.info(`${logPrefix} 🚫 Component unmounted, ignoring results`)
          return
        }
        
        if (error) {
          logger.error(`${logPrefix} ❌ Session error:`, error)
          setUser(null)
          setProfile(null)
        } else if (session?.user) {
          logger.info(`${logPrefix} ✅ User found:`, session.user.id)
          setUser(session.user)
          
          // 异步获取profile，不阻塞认证流程
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileError) {
              logger.warn(`${logPrefix} ⚠️ Profile not found (user may be new):`, profileError)
              setProfile(null)
            } else {
              logger.info(`${logPrefix} ✅ Profile loaded`)
              setProfile(profileData || null)
            }
          } catch (profileError) {
            logger.warn(`${logPrefix} ⚠️ Profile fetch failed:`, profileError)
            setProfile(null)
          }
        } else {
          logger.info(`${logPrefix} 👤 No user logged in`)
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        if (!mounted) return
        logger.error(`${logPrefix} ❌ Auth initialization failed:`, error)
        setUser(null)
        setProfile(null)
      } finally {
        if (mounted) {
          logger.info(`${logPrefix} ✅ Auth initialization complete`)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info(`${logPrefix} 🔄 Auth state changed:`, { event, hasSession: !!session })
        
        if (!mounted) {
          logger.info(`${logPrefix} 🚫 Component unmounted, ignoring auth state change`)
          return
        }
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              logger.info(`${logPrefix} 🔑 User signed in:`, session.user.id)
              setUser(session.user)
              // 异步获取profile
              refreshProfile()
            }
            break
            
          case 'SIGNED_OUT':
            logger.info(`${logPrefix} 🚪 User signed out`)
            setUser(null)
            setProfile(null)
            break
            
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              logger.info(`${logPrefix} 🔄 Token refreshed for user:`, session.user.id)
              setUser(session.user)
              // 可选：刷新profile
              // await refreshProfile()
            }
            break
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <UserContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
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