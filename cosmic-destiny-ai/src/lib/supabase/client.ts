import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

/**
 * 创建Supabase客户端
 * 这个函数现在每次被调用都会创建一个新的客户端实例。
 * 单例管理已移至 SupabaseProvider 中，以获得更可靠的React生命周期行为。
 */
export function createClient() {
  console.log('🏗️ Supabase: createClient function invoked...')
  
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

    return supabaseClient
  } catch (error) {
    console.error('❌ Supabase: Failed to create client:', error)
    throw error
  }
}