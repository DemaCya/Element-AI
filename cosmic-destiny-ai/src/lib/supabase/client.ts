import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'
import { logger } from '@/lib/logger'

// 全局单例客户端
let globalSupabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null
let clientCreationCount = 0

/**
 * 创建Supabase客户端（单例模式）
 * 注意：在React组件中，请使用 useSupabase() hook 而不是直接调用此函数
 * 此函数主要用于非React环境（如API路由、服务端代码等）
 */
export function createClient() {
  clientCreationCount++
  
  // 如果已有客户端，直接返回
  if (globalSupabaseClient) {
    const msg = `♻️ Returning existing global client (call #${clientCreationCount})`
    logger.supabase(msg)
    return globalSupabaseClient
  }

  logger.supabase(`✨ Creating new global client (call #${clientCreationCount})`)
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = 'Missing Supabase environment variables'
    logger.error(`❌ ${error}`)
    throw new Error('Missing Supabase configuration')
  }

  try {
    const client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    globalSupabaseClient = client
    
    logger.supabase('✅ Global client created and cached successfully')
    return client
  } catch (error) {
    logger.error('❌ Supabase: Failed to create client', error)
    throw error
  }
}

/**
 * 获取客户端创建统计
 */
export function getClientStats() {
  return {
    creationCount: clientCreationCount,
    hasClient: !!globalSupabaseClient
  }
}

/**
 * 重置全局客户端（主要用于测试或特殊情况）
 */
export function resetClient() {
  globalSupabaseClient = null
  logger.supabase('Global client reset')
}