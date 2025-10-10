import { createBrowserClient } from '@supabase/ssr'

// 使用全局变量确保单例模式在静态导出模式下也能工作
declare global {
  var __supabaseClient: ReturnType<typeof createBrowserClient> | undefined
}

// 创建一个全局的Supabase客户端实例
let _supabaseClient: ReturnType<typeof createBrowserClient> | null = null
let _clientCreationCount = 0

function getSupabaseClient() {
  if (_supabaseClient) {
    console.log('🔧 Supabase: Returning existing client (creation count:', _clientCreationCount, ')')
    return _supabaseClient
  }

  _clientCreationCount++
  console.log('🔧 Supabase: Creating new client (creation count:', _clientCreationCount, ')')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔧 Supabase配置检查:')
  console.log('URL存在:', !!supabaseUrl)
  console.log('Key存在:', !!supabaseAnonKey)
  console.log('URL:', supabaseUrl)
  console.log('Key前缀:', supabaseAnonKey?.substring(0, 10) + '...')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    console.error('URL:', supabaseUrl)
    console.error('Key:', supabaseAnonKey)
    throw new Error('Missing Supabase configuration')
  }

  try {
    _supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase客户端创建成功')
    return _supabaseClient
  } catch (error) {
    console.error('❌ Supabase客户端创建失败:', error)
    throw error
  }
}

export function createClient() {
  // 检查全局变量中是否已有客户端
  if (typeof window !== 'undefined' && globalThis.__supabaseClient) {
    console.log('🔧 Supabase: Returning existing global client')
    return globalThis.__supabaseClient
  }

  const client = getSupabaseClient()
  
  // 将客户端存储到全局变量中
  if (typeof window !== 'undefined') {
    globalThis.__supabaseClient = client
  }
  
  return client
}