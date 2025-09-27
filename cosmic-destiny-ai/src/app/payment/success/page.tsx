'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Sparkles, AlertCircle } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useUser()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth')
      return
    }

    // 从 URL 参数中获取支付信息
    const sessionId = searchParams.get('session_id')
    const productId = searchParams.get('product_id')
    const status = searchParams.get('status')
    const requestId = searchParams.get('request_id')

    if (status === 'paid' && sessionId) {
      setStatus('success')
      setMessage('支付成功！正在为您解锁完整报告...')
      
      // 延迟跳转到报告页面，让用户看到成功消息
      setTimeout(() => {
        const reportId = requestId?.split('_')[1] // 从 request_id 中提取 report_id
        if (reportId) {
          router.push(`/report/${reportId}`)
        } else {
          router.push('/dashboard')
        }
      }, 2000)
    } else {
      setStatus('error')
      setMessage('支付状态异常，请检查您的支付记录或联系客服')
    }
  }, [user, authLoading, router, searchParams])

  if (authLoading) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">正在验证支付状态...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="cosmic-bg min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-white mb-4">处理中...</h1>
              <p className="text-gray-300">正在验证您的支付信息</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex items-center justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">支付成功！</h1>
              <p className="text-gray-300 mb-6">{message}</p>
              <div className="flex items-center justify-center gap-2 text-purple-300">
                <Sparkles className="w-5 h-5" />
                <span>正在为您解锁完整报告...</span>
                <Sparkles className="w-5 h-5" />
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex items-center justify-center mb-6">
                <AlertCircle className="w-16 h-16 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">支付异常</h1>
              <p className="text-gray-300 mb-6">{message}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  返回仪表板
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  重新检查
                </Button>
              </div>
            </>
          )}
        </div>

        {/* 如果自动跳转失败，显示手动跳转按钮 */}
        {status === 'success' && (
          <div className="mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                const requestId = searchParams.get('request_id')
                const reportId = requestId?.split('_')[1]
                if (reportId) {
                  router.push(`/report/${reportId}`)
                } else {
                  router.push('/dashboard')
                }
              }}
              className="text-purple-300 hover:text-purple-200"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              立即查看完整报告
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
