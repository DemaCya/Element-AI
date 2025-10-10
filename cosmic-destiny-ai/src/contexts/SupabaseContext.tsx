'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'
import { logger } from '@/lib/logger'

interface SupabaseContextType {
  supabase: SupabaseClient<Database>
  isInitialized: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// 全局状态管理，避免Turbopack解析问题
interface GlobalSupabaseState {
  supabase: SupabaseClient<Database> | null
  isInitialized: boolean
  initCount: number
}

// 全局变量，使用window对象确保跨页面持久化
const getGlobalState = (): GlobalSupabaseState => {
  if (typeof window === 'undefined') {
    return {
      supabase: null,
      isInitialized: false,
      initCount: 0
    }
  }

  // 使用window对象确保跨页面持久化
  if (!(window as any).__cosmicSupabaseState) {
    const newState: GlobalSupabaseState = {
      supabase: null,
      isInitialized: false,
      initCount: 0
    }
    
    Object.assign((window as any), { __cosmicSupabaseState: newState })
    logger.supabase('🆔 Created new global state')
  }

  return (window as any).__cosmicSupabaseState
}


// 初始化Supabase客户端
function initializeSupabase() {
  const state = getGlobalState()
  state.initCount++

  logger.supabase(`🔄 Init call #${state.initCount}`)

  // 如果已经初始化，直接返回现有状态
  if (state.isInitialized && state.supabase) {
    logger.supabase('♻️ Reusing existing Supabase client')
    return state
  }

  // 检查重复初始化
  if (state.initCount > 1) {
    logger.supabase(`⚠️ Multiple init calls detected: ${state.initCount}`)
  }

  if (typeof window === 'undefined') {
    logger.supabase('🖥️ Server side, skipping initialization')
    return state
  }

  try {
    logger.supabase(`✨ Initializing Supabase client (call #${state.initCount})`)
    const client = createClient()
    state.supabase = client
    state.isInitialized = true
    logger.supabase('✅ Supabase client initialized successfully')

    // 恢复持久化日志
    setTimeout(() => {
      const logs = logger.getLogs()
      if (logs.length > 0) {
        logger.supabase(`📋 Restored ${logs.length} persistent logs`)
      }
    }, 100)

  } catch (error) {
    logger.error('❌ Supabase: Failed to initialize', error)
    state.supabase = null
    state.isInitialized = true
  }

  return state
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GlobalSupabaseState>(() => {
    // 检查是否已经初始化过
    const existingState = getGlobalState()
    if (existingState.isInitialized && existingState.supabase) {
      logger.supabase('♻️ SupabaseProvider: Reusing existing initialized state')
      return existingState
    }
    
    // 只有在真正需要时才初始化
    logger.supabase('🔄 SupabaseProvider: Initializing for the first time')
    return initializeSupabase()
  })

  // 监听页面导航事件
  useEffect(() => {
    const handleNavigation = () => {
      logger.supabase('🧭 Navigation detected, preserving Supabase state')
      const state = getGlobalState()
      setState({ ...state })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleNavigation)

      const originalPushState = history.pushState
      const originalReplaceState = history.replaceState

      history.pushState = function(...args) {
        originalPushState.apply(history, args)
        setTimeout(handleNavigation, 0)
      }

      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args)
        setTimeout(handleNavigation, 0)
      }

      return () => {
        window.removeEventListener('popstate', handleNavigation)
        history.pushState = originalPushState
        history.replaceState = originalReplaceState
      }
    }
  }, [])

  // Loading状态
  if (typeof window === 'undefined' || !state.isInitialized) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-white text-sm">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <SupabaseContext.Provider value={{ supabase: state.supabase!, isInitialized: state.isInitialized }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context.supabase
}

// 导出创建客户端的函数
export { createClient }