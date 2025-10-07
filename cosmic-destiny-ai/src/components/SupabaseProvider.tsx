'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

interface SupabaseProviderProps {
  children: React.ReactNode
}

export default function SupabaseProvider({ children }: SupabaseProviderProps) {
  // 静态模式下不创建Supabase客户端
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <>{children}</>
  }

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  return (
    <>{children}</>
  )
}