import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

// 在全局范围内声明一个变量来缓存客户端
// @ts-ignore
let supabaseSingleton: ReturnType<typeof createSupabaseClient<Database>> = null

/**
 * 创建Supabase客户端（使用更强大的单例模式）
 * 即使在React组件树被意外重新挂载时，也能确保只有一个客户端实例。
 */
export function createClient() {
  // 如果单例已存在，直接返回
  if (supabaseSingleton) {
    console.log('🔄 Supabase: Using existing singleton client instance')
    return supabaseSingleton
  }

  console.log('🏗️ Supabase: createClient function invoked (creating singleton)...')
  
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
    const supabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    })
    
    // 存储客户端ID用于调试
    ;(supabaseClient as any)._clientId = clientId
    
    console.log('✅ Supabase: New client instance created successfully', {
      clientId,
      hasAuth: !!supabaseClient.auth,
      hasFrom: typeof supabaseClient.from === 'function'
    })

    // 将新创建的客户端存为单例
    supabaseSingleton = supabaseClient
    return supabaseClient
  } catch (error) {
    console.error('❌ Supabase: Failed to create client:', error)
    throw error
  }
}