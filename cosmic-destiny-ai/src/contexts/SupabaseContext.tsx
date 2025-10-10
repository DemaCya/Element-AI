'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'
import { logger } from '@/lib/logger'

interface SupabaseContextType {
  supabase: SupabaseClient<Database>
  isInitialized: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// 全局状态，确保只初始化一次
let globalSupabaseState: {
  supabase: SupabaseClient<Database> | null
  isInitialized: boolean
  initCount: number
} = {
  supabase: null,
  isInitialized: false,
  initCount: 0
}

// 初始化函数，只执行一次
function initializeSupabase() {
  globalSupabaseState.initCount++
  
  if (globalSupabaseState.isInitialized && globalSupabaseState.supabase) {
    logger.supabase(`Already initialized (call #${globalSupabaseState.initCount}), returning existing state`)
    return globalSupabaseState
  }

  if (typeof window === 'undefined') {
    logger.supabase('Server side, skipping initialization')
    return globalSupabaseState
  }

  try {
    logger.supabase(`✨ Initializing for the first time (call #${globalSupabaseState.initCount})`)
    const client = createClient()
    globalSupabaseState = {
      supabase: client,
      isInitialized: true,
      initCount: globalSupabaseState.initCount
    }
    logger.supabase('✅ Global state initialized successfully')
  } catch (error) {
    logger.error('❌ Supabase: Failed to initialize', error)
    globalSupabaseState = {
      supabase: null,
      isInitialized: true, // 即使失败也设置为true，避免无限loading
      initCount: globalSupabaseState.initCount
    }
  }

  return globalSupabaseState
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // 使用 useMemo 确保只初始化一次，不使用 useState
  const state = useMemo(() => {
    // 在组件初始化时检查全局状态
    return initializeSupabase()
  }, []) // 空依赖数组，确保只运行一次

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
