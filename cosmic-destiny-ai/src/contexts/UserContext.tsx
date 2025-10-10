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

// 全局用户状态管理，避免页面导航时重复检查
const getGlobalUserState = () => {
  if (typeof window === 'undefined') {
    return {
      cachedUser: null,
      cachedProfile: null,
      lastCheck: 0,
      sessionId: null
    }
  }

  if (!(window as any).__cosmicUserState) {
    (window as any).__cosmicUserState = {
      cachedUser: null,
      cachedProfile: null,
      lastCheck: 0,
      sessionId: Date.now().toString(36)
    }
  }

  return (window as any).__cosmicUserState
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useSupabase()

  useEffect(() => {
    let isMounted = true
    const globalUserState = getGlobalUserState()

    const getUser = async () => {
      const currentTime = Date.now()
      const timeSinceLastCheck = currentTime - globalUserState.lastCheck

      logger.supabase(`🔍 UserContext: getUser, timeSinceLastCheck: ${timeSinceLastCheck}ms`)

      try {
        // 如果最近检查过且有缓存用户，直接使用缓存（减少网络请求）
        // 增加缓存时间到30秒，减少频繁调用
        if (timeSinceLastCheck < 30000 && globalUserState.cachedUser) {
          logger.supabase('📦 UserContext: Using cached user data')
          setUser(globalUserState.cachedUser)
          setProfile(globalUserState.cachedProfile)
          setLoading(false)
          return
        }

        // 如果正在加载中，避免重复请求
        if (loading && timeSinceLastCheck < 1000) {
          logger.supabase('⏳ UserContext: Already loading, skipping duplicate request')
          return
        }

        logger.supabase('🔍 UserContext: Calling supabase.auth.getUser()')
        const { data: { user }, error } = await supabase.auth.getUser()

        if (!isMounted) return

        logger.supabase('🔍 UserContext: getUser result:', { user: user?.id, error })

        if (error) {
          logger.error('UserContext: getUser error:', error)
          setUser(null)
          setProfile(null)
          globalUserState.cachedUser = null
          globalUserState.cachedProfile = null
        } else {
          setUser(user)
          globalUserState.cachedUser = user

          if (user) {
            logger.supabase('🔍 UserContext: Fetching profile for user:', user.id)
            // 获取用户profile信息
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()

            if (!isMounted) return

            if (profileError) {
              logger.error('UserContext: Profile fetch error:', profileError)
              setProfile(null)
              globalUserState.cachedProfile = null
            } else {
              logger.supabase('🔍 UserContext: Profile fetched:', (profileData as any)?.id)
              setProfile(profileData)
              globalUserState.cachedProfile = profileData
            }
          } else {
            setProfile(null)
            globalUserState.cachedProfile = null
          }
        }

        globalUserState.lastCheck = currentTime

      } catch (error) {
        if (!isMounted) return
        logger.error('UserContext: getUser exception:', error)
        setUser(null)
        setProfile(null)
        globalUserState.cachedUser = null
        globalUserState.cachedProfile = null
      } finally {
        if (isMounted) {
          logger.supabase('🔍 UserContext: Setting loading to false')
          setLoading(false)
        }
      }
    }

    // 设置初始加载超时，避免长时间loading
    const loadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        logger.supabase('⏰ UserContext: Loading timeout, setting loading to false')
        setLoading(false)
      }
    }, 3000)

    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (!isMounted) return

        logger.supabase('🔍 UserContext: Auth state change:', { event, userId: session?.user?.id })

        if (event === 'SIGNED_IN' && session?.user) {
          logger.supabase('🔍 UserContext: User signed in:', session.user.id)
          setUser(session.user)
          globalUserState.cachedUser = session.user

          // 获取用户profile信息
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (isMounted) {
            if (profileError) {
              logger.error('UserContext: Profile fetch error on sign in:', profileError)
              setProfile(null)
              globalUserState.cachedProfile = null
            } else {
              logger.supabase('🔍 UserContext: Profile fetched on sign in:', (profileData as any)?.id)
              setProfile(profileData)
              globalUserState.cachedProfile = profileData
            }
          }
        } else if (event === 'SIGNED_OUT') {
          logger.supabase('🔍 UserContext: User signed out')
          setUser(null)
          setProfile(null)
          globalUserState.cachedUser = null
          globalUserState.cachedProfile = null
        }

        // 只在特定事件时设置loading为false
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          logger.supabase('🔍 UserContext: Setting loading to false due to auth event:', event)
          if (isMounted) {
            setLoading(false)
          }
        }
      }
    )

    return () => {
      isMounted = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [supabase, loading])

  const signOut = async () => {
    try {
      const globalUserState = getGlobalUserState()

      const { error } = await supabase.auth.signOut()
      if (error) {
        logger.error('UserContext: Sign out error:', error)
      }

      // 清除全局缓存
      globalUserState.cachedUser = null
      globalUserState.cachedProfile = null
      globalUserState.lastCheck = 0

      setUser(null)
      setProfile(null)

      logger.supabase('👋 UserContext: User signed out successfully')
    } catch (error) {
      logger.error('UserContext: Sign out exception:', error)
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