import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

// 全局单例客户端（在整个应用生命周期中只创建一次）
let globalSupabaseClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

/**
 * 创建Supabase客户端（单例模式）
 * 使用标准的 @supabase/supabase-js 包，适合静态导出模式
 */
export function createClient() {
  // 如果已有客户端，直接返回（同一个页面会话内）
  if (globalSupabaseClient) {
    console.log('🔄 Supabase: Using existing client instance', {
      hasAuth: !!globalSupabaseClient.auth,
      hasFrom: typeof globalSupabaseClient.from === 'function',
      clientId: (globalSupabaseClient as any)._clientId || 'unknown'
    })
    return globalSupabaseClient
  }
  
  console.log('🏗️ Supabase: Creating new client instance (standard JS client)...')
  
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
    // 生成一个简单的客户端ID用于调试
    const clientId = 'client_' + Date.now()
    
    // 使用标准的 createClient，适合客户端静态应用
    globalSupabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    })
    
    // 存储客户端ID用于调试
    ;(globalSupabaseClient as any)._clientId = clientId
    
    console.log('✅ Supabase: Client created successfully (standard JS client)', {
      clientId,
      hasAuth: !!globalSupabaseClient.auth,
      hasFrom: typeof globalSupabaseClient.from === 'function'
    })
  } catch (error) {
    console.error('❌ Supabase: Failed to create client:', error)
    throw error
  }
  
  return globalSupabaseClient
}