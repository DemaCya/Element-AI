'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

interface SupabaseContextType {
  supabase: SupabaseClient<Database>
  isInitialized: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// 全局单例客户端
let globalSupabaseClient: SupabaseClient<Database> | null = null

function createSupabaseClient(): SupabaseClient<Database> {
  if (globalSupabaseClient) {
    console.log('🔧 Supabase: Returning existing global client')
    return globalSupabaseClient
  }

  console.log('🔧 Supabase: Creating new global client')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    throw new Error('Missing Supabase configuration')
  }

  const client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  globalSupabaseClient = client
  
  console.log('✅ Supabase: Global client created and cached')
  return client
}

// 全局状态，确保只初始化一次
let globalSupabaseState: {
  supabase: SupabaseClient<Database> | null
  isInitialized: boolean
} = {
  supabase: null,
  isInitialized: false
}

// 初始化函数，只执行一次
function initializeSupabase() {
  if (globalSupabaseState.isInitialized) {
    console.log('🔧 Supabase: Already initialized, returning existing state')
    return globalSupabaseState
  }

  if (typeof window === 'undefined') {
    console.log('🔧 Supabase: Server side, skipping initialization')
    return globalSupabaseState
  }

  try {
    const client = createSupabaseClient()
    globalSupabaseState = {
      supabase: client,
      isInitialized: true
    }
    console.log('✅ Supabase: Global state initialized')
  } catch (error) {
    console.error('❌ Supabase: Failed to initialize', error)
    globalSupabaseState = {
      supabase: null,
      isInitialized: true // 即使失败也设置为true，避免无限loading
    }
  }

  return globalSupabaseState
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(() => {
    // 在组件初始化时检查全局状态
    const globalState = initializeSupabase()
    return globalState
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
export { createSupabaseClient }
