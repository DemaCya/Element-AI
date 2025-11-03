'use client'

import React, { useState } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
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

  const supabase = useSupabase()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        // 注册新用户
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        })

        if (error) {
          setError(error.message)
          return
        }

        if (data.user) {
          setError('注册成功！请检查您的邮箱以验证账户。')
          // 等待一下再跳转，让用户看到成功消息
          setTimeout(() => {
            onSuccess?.()
          }, 2000)
        }
      } else {
        // 登录现有用户
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          setError(error.message)
          return
        }

        if (data.user) {
          onSuccess?.()
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(`认证失败: ${error.message || '请重试'}`)
    } finally {
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