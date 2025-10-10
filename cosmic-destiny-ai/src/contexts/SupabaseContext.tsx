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

// 使用 window 对象保持全局状态，避免页面导航时重置
const getGlobalState = () => {
  if (typeof window === 'undefined') {
    return {
      supabase: null,
      isInitialized: false,
      initCount: 0
    }
  }
  
  if (!(window as any).__cosmicSupabaseState) {
    (window as any).__cosmicSupabaseState = {
      supabase: null,
      isInitialized: false,
      initCount: 0
    }
  }
  
  return (window as any).__cosmicSupabaseState
}

// 初始化函数，只执行一次
function initializeSupabase() {
  const globalSupabaseState = getGlobalState()
  globalSupabaseState.initCount++
  
  // 如果已经初始化，静默返回（减少日志噪音）
  if (globalSupabaseState.isInitialized && globalSupabaseState.supabase) {
    // 只在第一次调用时记录日志
    if (globalSupabaseState.initCount === 1) {
      logger.supabase('✅ Supabase already initialized, returning existing client')
    }
    return globalSupabaseState
  }

  if (typeof window === 'undefined') {
    logger.supabase('Server side, skipping initialization')
    return globalSupabaseState
  }

  try {
    logger.supabase(`✨ Initializing Supabase client (call #${globalSupabaseState.initCount})`)
    const client = createClient()
    globalSupabaseState.supabase = client
    globalSupabaseState.isInitialized = true
    logger.supabase('✅ Supabase client initialized successfully')
  } catch (error) {
    logger.error('❌ Supabase: Failed to initialize', error)
    globalSupabaseState.supabase = null
    globalSupabaseState.isInitialized = true // 即使失败也设置为true，避免无限loading
  }

  return globalSupabaseState
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // 直接使用全局状态，避免重复初始化
  const [state] = useState(() => {
    // 只在组件第一次挂载时初始化
    return initializeSupabase()
  })

  // 在客户端渲染完成前显示loading
  if (typeof window === 'undefined' || !state.isInitialized || !state.supabase) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <SupabaseContext.Provider value={{ supabase: state.supabase, isInitialized: state.isInitialized }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context.supabase as any
}

// 导出创建客户端的函数，供非React环境使用（如API路由）
export { createClient }
