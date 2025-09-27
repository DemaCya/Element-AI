'use client'

import React from 'react'
import AppProviders from '@/components/AppProviders'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <AppProviders>{children}</AppProviders>
}