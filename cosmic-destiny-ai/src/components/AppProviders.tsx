'use client'

import React from 'react'
import SupabaseProvider from '@/components/SupabaseProvider'
import { UserProvider } from '@/contexts/UserContext'

interface AppProvidersProps {
  children: React.ReactNode
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <SupabaseProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </SupabaseProvider>
  )
}