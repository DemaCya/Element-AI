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
      logger.info('UserContext: refreshProfile called but no user is logged in.');
      return;
    }
    logger.info(`UserContext: Manually refreshing profile for user: ${user.id}`);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        logger.error('UserContext: Error refreshing profile:', profileError);
      } else {
        logger.info('UserContext: Profile refreshed successfully.', { hasProfile: !!profileData });
        setProfile(profileData || null);
      }
    } catch (error) {
      logger.error('UserContext: Exception during profile refresh:', error);
    }
  };


  useEffect(() => {
    const logPrefix = `[user-context-${Date.now()}]`
    logger.info(`${logPrefix} Initializing...`)
    let mounted = true
    let timeoutReached = false
    
    // 超时保护：10秒后强制结束loading
    const timeout = setTimeout(() => {
      if (mounted && !timeoutReached) {
        logger.warn(`${logPrefix} ⚠️ User loading timeout, forcing loading=false`)
        timeoutReached = true
        setLoading(false)
      }
    }, 10000)

    // 获取当前用户
    async function loadUser() {
      try {
        logger.info(`${logPrefix} 📡 Fetching user...`)
        
        const startTime = Date.now()
        
        // 先尝试getSession()（快速，从localStorage读取）
        logger.info(`${logPrefix} ⏱️ Calling supabase.auth.getSession()...`)
        logger.info(`${logPrefix} ⏱️ Supabase client check:`, {
          hasSupabase: !!supabase,
          hasAuth: !!supabase?.auth,
          hasGetSession: typeof supabase?.auth?.getSession === 'function'
        })
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        let user = session?.user || null
        
        const elapsed = Date.now() - startTime
        logger.info(`${logPrefix} 📬 Session fetch completed in ${elapsed}ms`, { hasSession: !!session, hasError: !!sessionError })
        
        // 如果getSession()没有返回用户，尝试getUser()（从服务器验证）
        if (!user && !sessionError) {
          logger.info(`${logPrefix} ⏱️ No session found, trying getUser()...`)
          const getUserStart = Date.now()
          const { data, error: getUserError } = await supabase.auth.getUser()
          const getUserElapsed = Date.now() - getUserStart
          logger.info(`${logPrefix} 📬 getUser() completed in ${getUserElapsed}ms`, { hasUser: !!data?.user })
          
          if (data?.user) {
            user = data.user
          }
        }
        
        if (!mounted) {
          logger.info(`${logPrefix} 🚫 Component unmounted, ignoring results`)
          return
        }
        
        setUser(user)
        
        // 如果有用户，获取profile
        if (user) {
          logger.info(`${logPrefix} 👤 User found, fetching profile for:`, user.id)
          
          const profileStartTime = Date.now()
          logger.info(`${logPrefix} 📊 Building profile query...`)
          const profileQuery = supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          logger.info(`${logPrefix} 📊 Executing profile query...`)
          const { data: profileData, error: profileError } = await profileQuery
          
          const profileElapsed = Date.now() - profileStartTime
          logger.info(`${logPrefix} 📬 Profile fetch completed in ${profileElapsed}ms`, { hasProfile: !!profileData, hasError: !!profileError })
          
          if (!mounted) {
            logger.info(`${logPrefix} 🚫 Component unmounted after profile fetch`)
            return
          }
          
          if (profileError) {
            logger.error(`${logPrefix} ❌ Failed to get profile:`, profileError)
            logger.error(`${logPrefix} ❌ Profile error details:`, JSON.stringify(profileError))
          }
          
          setProfile(profileData || null)
        } else {
          logger.info(`${logPrefix} 👤 No user logged in`)
          setProfile(null)
        }
      } catch (error) {
        if (!mounted) return
        logger.error(`${logPrefix} ❌ Exception loading user:`, error)
        logger.error(`${logPrefix} ❌ Exception details:`, JSON.stringify(error, Object.getOwnPropertyNames(error)))
        setUser(null)
        setProfile(null)
      } finally {
        if (mounted && !timeoutReached) {
          logger.info(`${logPrefix} ✅ Loading complete`)
          clearTimeout(timeout)
          setLoading(false)
        }
      }
    }

    loadUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info(`${logPrefix} 🔄 Auth state changed:`, { event, hasSession: !!session });
        if (!mounted) {
            logger.info(`${logPrefix} 🚫 Component unmounted, ignoring auth state change.`);
            return;
        }
        
        const userChanged = session?.user?.id !== user?.id;

        if (event === 'SIGNED_IN' && session?.user) {
          logger.info(`${logPrefix} 🔑 SIGNED_IN event. User: ${session.user.id}`);
          if (userChanged) {
            setUser(session.user)
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if(profileError) {
              logger.error(`${logPrefix} ❌ Error fetching profile on SIGNED_IN:`, profileError);
            } else {
              logger.info(`${logPrefix} ✅ Profile fetched on SIGNED_IN.`);
            }
            setProfile(profileData || null)
          } else {
            logger.info(`${logPrefix} 🔑 SIGNED_IN event for existing user, session refreshed. No data fetch needed.`);
            setUser(session.user);
          }

        } else if (event === 'SIGNED_OUT') {
          logger.info(`${logPrefix} 🚪 SIGNED_OUT event.`);
          setUser(null)
          setProfile(null)
        
        } else if (event === 'USER_UPDATED' && session?.user) {
            logger.info(`${logPrefix} 🔄 USER_UPDATED event. User: ${session.user.id}`);
            setUser(session.user);
            // Optionally, you might want to refresh the profile here as well
            await refreshProfile();

        } else if (event === 'TOKEN_REFRESHED' && session?.user && userChanged) {
            logger.info(`${logPrefix} 🔄 TOKEN_REFRESHED event with a new user.`);
            setUser(session.user);
            await refreshProfile();
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [supabase, user])

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