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

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // 只在客户端初始化
    if (typeof window === 'undefined') return

    try {
      const client = createSupabaseClient()
      setSupabase(client)
      setIsInitialized(true)
      console.log('✅ SupabaseProvider: Client initialized')
    } catch (error) {
      console.error('❌ SupabaseProvider: Failed to initialize client', error)
      setIsInitialized(true) // 即使失败也设置为true，避免无限loading
    }
  }, [])

  // 在客户端渲染完成前显示loading
  if (typeof window === 'undefined' || !isInitialized || !supabase) {
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
    <SupabaseContext.Provider value={{ supabase, isInitialized }}>
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

// 导出创建客户端的函数，供非React环境使用（如API路由）
export { createSupabaseClient }
