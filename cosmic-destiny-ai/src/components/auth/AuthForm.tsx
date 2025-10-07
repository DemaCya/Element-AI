'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

interface AuthFormProps {
  onSuccess?: () => void
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 模拟认证过程
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (isSignUp) {
        // 模拟注册成功
        const mockUser = {
          id: `demo-user-${Date.now()}`,
          email: email,
          createdAt: new Date().toISOString(),
          profile: {
            fullName: fullName,
            avatarUrl: undefined
          }
        }
        
        localStorage.setItem('mockUser', JSON.stringify(mockUser))
        setError('注册成功！正在登录...')
        
        setTimeout(() => {
          onSuccess?.()
        }, 1000)
      } else {
        // 模拟登录成功
        const mockUser = {
          id: 'demo-user-1',
          email: email,
          createdAt: new Date().toISOString(),
          profile: {
            fullName: '演示用户',
            avatarUrl: undefined
          }
        }
        
        localStorage.setItem('mockUser', JSON.stringify(mockUser))
        onSuccess?.()
      }
    } catch (error: any) {
      setError('认证失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      // 模拟Google登录
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser = {
        id: 'demo-user-google',
        email: 'demo@gmail.com',
        createdAt: new Date().toISOString(),
        profile: {
          fullName: 'Google用户',
          avatarUrl: undefined
        }
      }
      
      localStorage.setItem('mockUser', JSON.stringify(mockUser))
      onSuccess?.()
    } catch (error: any) {
      setError('Google登录失败，请重试')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-glow mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-gray-400">
          {isSignUp
            ? 'Begin your cosmic journey today'
            : 'Sign in to access your destiny reports'
          }
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-slate-800 border-purple-500/20 text-white"
              required={isSignUp}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-800 border-purple-500/20 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 border-purple-500/20 text-white pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className={`text-sm ${error.includes('check your email') ? 'text-green-400' : 'text-red-400'}`}>
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="cosmic"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-gray-400">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full mt-4 bg-slate-800 border-purple-500/20 text-white hover:bg-purple-500/10"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"
          }
        </button>
      </div>
    </div>
  )
}