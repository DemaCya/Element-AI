import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

// 全局单例客户端
let globalSupabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * 创建Supabase客户端（单例模式）
 * 注意：在React组件中，请使用 useSupabase() hook 而不是直接调用此函数
 * 此函数主要用于非React环境（如API路由、服务端代码等）
 */
export function createClient() {
  // 如果已有客户端，直接返回
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

  try {
    const client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    globalSupabaseClient = client
    
    console.log('✅ Supabase: Global client created and cached')
    return client
  } catch (error) {
    console.error('❌ Supabase: Failed to create client', error)
    throw error
  }
}

/**
 * 重置全局客户端（主要用于测试或特殊情况）
 */
export function resetClient() {
  globalSupabaseClient = null
  console.log('🔧 Supabase: Global client reset')
}