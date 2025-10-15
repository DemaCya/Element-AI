import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

// 在 window 对象上定义一个全局变量来缓存客户端
declare global {
  interface Window {
    supabase_client_singleton: ReturnType<typeof createSupabaseClient<Database>>
  }
}

/**
 * 创建一个真正的全局Supabase客户端单例
 * 将客户端附加到 `window` 对象，以确保即使模块作用域被意外重置，它也能持久存在。
 */
export function createClient() {
  // 如果单例已经存在于window对象上，直接返回
  if (typeof window !== 'undefined' && window.supabase_client_singleton) {
    console.log('🔄 Supabase: Using existing global singleton client from window object')
    return window.supabase_client_singleton
  }

  console.log('🏗️ Supabase: createClient function invoked (creating global singleton)...')
  
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
    
    // 使用标准的 createClient
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
    
    console.log('✅ Supabase: New global singleton client created successfully', {
      clientId,
      hasAuth: !!supabaseClient.auth,
      hasFrom: typeof supabaseClient.from === 'function'
    })

    // 将新创建的客户端存储到window对象上
    if (typeof window !== 'undefined') {
      window.supabase_client_singleton = supabaseClient
    }
    
    return supabaseClient
  } catch (error) {
    console.error('❌ Supabase: Failed to create client:', error)
    throw error
  }
}