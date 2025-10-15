'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

interface SupabaseContextType {
  supabase: SupabaseClient<Database>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  console.log('🏗️ SupabaseProvider: Component rendering...')
  
  // 使用 useMemo 确保只创建一次客户端，避免每次渲染都调用
  const supabase = useMemo(() => {
    console.log('🏗️ SupabaseProvider: useMemo callback executing (creating client)...')
    const client = createClient()
    console.log('✅ SupabaseProvider: Client created and memoized')
    return client
  }, [])

  console.log('🏗️ SupabaseProvider: Providing context to children')
  return (
    <SupabaseContext.Provider value={{ supabase }}>
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