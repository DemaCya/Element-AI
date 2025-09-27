'use client'

import { Database } from '@/lib/database.types'

interface SupabaseProviderProps {
  children: React.ReactNode
}

export default function SupabaseProvider({ children }: SupabaseProviderProps) {
  // Don't initialize Supabase client during build time
  // The client will be initialized dynamically when needed
  return (
    <>{children}</>
  )
}