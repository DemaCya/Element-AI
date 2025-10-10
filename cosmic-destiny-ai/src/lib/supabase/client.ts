import { createBrowserClient } from '@supabase/ssr'

// 使用全局变量确保单例模式在静态导出模式下也能工作
declare global {
  var __supabaseClient: ReturnType<typeof createBrowserClient> | undefined
  var __supabaseCreationCount: number | undefined
}

let _clientCreationCount = 0

// 尝试使用window对象来存储客户端，更可靠
function getGlobalClient() {
  if (typeof window === 'undefined') return null
  return (window as any).__supabaseClient
}

function setGlobalClient(client: ReturnType<typeof createBrowserClient>) {
  if (typeof window === 'undefined') return
  ;(window as any).__supabaseClient = client
}

export function createClient() {
  // 添加调用栈信息来调试
  const stack = new Error().stack
  const caller = stack?.split('\n')[2]?.trim() || 'unknown'
  
  // 初始化全局计数器
  if (typeof window !== 'undefined' && globalThis.__supabaseCreationCount === undefined) {
    globalThis.__supabaseCreationCount = 0
  }
  
  // 检查全局变量中是否已有客户端
  const existingClient = getGlobalClient()
  console.log('🔧 Supabase: Checking global client...', {
    hasWindow: typeof window !== 'undefined',
    hasGlobalClient: !!existingClient,
    hasGlobalThisClient: !!globalThis.__supabaseClient,
    globalCount: globalThis.__supabaseCreationCount,
    caller: caller
  })
  
  if (existingClient) {
    console.log('🔧 Supabase: Returning existing window client (global count:', globalThis.__supabaseCreationCount, ')', 'caller:', caller)
    return existingClient
  }

  // 增加全局计数器
  if (typeof window !== 'undefined') {
    globalThis.__supabaseCreationCount = (globalThis.__supabaseCreationCount || 0) + 1
  }
  _clientCreationCount++
  
  console.log('🔧 Supabase: Creating new client (global count:', globalThis.__supabaseCreationCount, ', local count:', _clientCreationCount, ')', 'caller:', caller)
  
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
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
    
    // 将客户端存储到window对象和全局变量中
    setGlobalClient(client)
    if (typeof window !== 'undefined') {
      globalThis.__supabaseClient = client
    }
    
    console.log('✅ Supabase客户端创建成功并存储到window和globalThis')
    return client
  } catch (error) {
    console.error('❌ Supabase客户端创建失败:', error)
    throw error
  }
}