import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // 如果已经创建过客户端，直接返回
  if (supabaseClient) {
    return supabaseClient
  }

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

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Supabase客户端创建成功')
  return supabaseClient
}