'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/types'

interface UserContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      // 检查本地存储的模拟用户
      const mockUserStr = localStorage.getItem('mockUser')
      if (mockUserStr) {
        const mockUser = JSON.parse(mockUserStr)
        setUser(mockUser)
        setLoading(false)
        return
      }

      // 创建默认演示用户
      const demoUser = {
        id: 'demo-user-1',
        email: 'demo@cosmicdestiny.com',
        createdAt: new Date().toISOString(),
        profile: {
          fullName: '演示用户',
          avatarUrl: undefined
        }
      }

      setUser(demoUser)
      setLoading(false)
    }

    getUser()
  }, [])

  const signOut = async () => {
    // 清除模拟用户
    localStorage.removeItem('mockUser')
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, loading, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}