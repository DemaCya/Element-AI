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

// 增强的全局状态管理，包含页面导航持久化
const getGlobalState = () => {
  if (typeof window === 'undefined') {
    return {
      supabase: null,
      isInitialized: false,
      initCount: 0,
      sessionId: null
    }
  }

  if (!(window as any).__cosmicSupabaseState) {
    // 生成唯一会话ID，用于跟踪页面刷新
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2)

    (window as any).__cosmicSupabaseState = {
      supabase: null,
      isInitialized: false,
      initCount: 0,
      sessionId,
      lastNavigationTime: Date.now()
    }

    logger.supabase(`🆔 Created new session: ${sessionId}`)
  }

  // 记录页面导航时间
  (window as any).__cosmicSupabaseState.lastNavigationTime = Date.now()

  return (window as any).__cosabaseState
}

// 增强的初始化函数，处理页面导航状态
function initializeSupabase() {
  const globalSupabaseState = getGlobalState()
  globalSupabaseState.initCount++

  const currentTime = Date.now()
  const timeSinceLastNavigation = currentTime - (globalSupabaseState.lastNavigationTime || 0)
  const isPageNavigation = timeSinceLastNavigation < 1000 // 1秒内的导航认为是页面导航

  logger.supabase(`🔄 Init call #${globalSupabaseState.initCount}, session: ${globalSupabaseState.sessionId}, isNavigation: ${isPageNavigation}`)

  // 如果已经初始化且是页面导航，直接返回现有客户端
  if (globalSupabaseState.isInitialized && globalSupabaseState.supabase) {
    if (isPageNavigation) {
      logger.supabase('🚀 Page navigation detected, reusing existing client')
    }
    return globalSupabaseState
  }

  if (typeof window === 'undefined') {
    logger.supabase('🖥️ Server side, skipping initialization')
    return globalSupabaseState
  }

  try {
    logger.supabase(`✨ Initializing Supabase client (call #${globalSupabaseState.initCount}, session: ${globalSupabaseState.sessionId})`)
    const client = createClient()
    globalSupabaseState.supabase = client
    globalSupabaseState.isInitialized = true
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
    globalSupabaseState.supabase = null
    globalSupabaseState.isInitialized = true // 即使失败也设置为true，避免无限loading
  }

  return globalSupabaseState
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(() => {
    // 只在组件第一次挂载时初始化
    return initializeSupabase()
  })

  // 监听页面导航事件
  useEffect(() => {
    const handleNavigation = () => {
      logger.supabase('🧭 Navigation detected, preserving Supabase state')
      setState(initializeSupabase())
    }

    // 监听路由变化
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleNavigation)

      // 监听 pushstate/replacestate (SPA导航)
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

  // 在客户端渲染完成前显示loading，但减少等待时间
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
