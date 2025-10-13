import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

// 全局单例客户端（在整个应用生命周期中只创建一次）
let globalSupabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * 创建Supabase客户端（单例模式）
 * 在静态导出模式下，每次页面刷新都会重新创建，这是正常的
 */
export function createClient() {
  // 如果已有客户端，直接返回（同一个页面会话内）
  if (globalSupabaseClient) {
    console.log('🔄 Supabase: Using existing client instance')
    return globalSupabaseClient
  }
  
  console.log('🏗️ Supabase: Creating new client instance...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔍 Supabase: Environment check', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl?.substring(0, 30) + '...' // 只显示前30个字符
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase: Missing environment variables!')
    throw new Error('Missing Supabase environment variables')
  }

  try {
    globalSupabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase: Client created successfully')
  } catch (error) {
    console.error('❌ Supabase: Failed to create client:', error)
    throw error
  }
  
  return globalSupabaseClient
}