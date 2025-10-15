'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useSupabase } from '@/contexts/SupabaseContext'
import { Button } from '@/components/ui/button'
import DebugInfo from '@/components/DebugInfo'

// 强制动态渲染
export const dynamic = 'force-dynamic'
import {
  ArrowLeft,
  Star,
  Zap,
  Heart,
  Briefcase,
  Compass,
  Download,
  Share,
  Sparkles,
  Calendar,
  Clock,
  Globe
} from 'lucide-react'
import { Database } from '@/lib/database.types'

type CosmicReport = Database['public']['Tables']['user_reports']['Row']

// 使用useSearchParams的组件
function ReportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useUser()
  const [report, setReport] = useState<CosmicReport | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useSupabase()

  const fetchReport = useCallback(async () => {
    const reportId = searchParams.get('id')
    
    console.log('📄 Report: fetchReport called with:', { reportId, userId: user?.id })
    
    if (!reportId) {
      console.log('❌ Report: No report ID, redirecting to dashboard')
      setLoading(false)
      router.push('/dashboard')
      return
    }
    
    if (!user) {
      console.log('⏳ Report: No user yet, waiting...')
      return
    }

    try {
      console.log('🔍 Report: Starting to fetch report with ID:', reportId, 'for user:', user.id)
      setLoading(true)
      
      // 添加超时保护
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      )
      
      const queryPromise = supabase
        .from('user_reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .single()
      
      console.log('📡 Report: Query sent, waiting for response...')
      
      const { data, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any

      console.log('📬 Report: Response received', { hasData: !!data, hasError: !!error })

      if (error) {
        console.error('❌ Report: Error fetching report:', error)
        console.error('❌ Report: Error details:', JSON.stringify(error))
        alert('无法加载报告，将返回控制台。错误：' + error.message)
        setLoading(false)
        router.push('/dashboard')
        return
      }

      if (!data) {
        console.error('❌ Report: No data returned')
        alert('报告不存在或您无权访问')
        setLoading(false)
        router.push('/dashboard')
        return
      }

      console.log('✅ Report: Report fetched successfully', data)
      setReport(data)
      setLoading(false)
    } catch (error) {
      console.error('❌ Report: Exception while fetching report:', error)
      console.error('❌ Report: Exception details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
      alert('加载报告时出错，将返回控制台。错误：' + (error instanceof Error ? error.message : String(error)))
      setLoading(false)
      router.push('/dashboard')
    }
  }, [searchParams, user, supabase, router])

  useEffect(() => {
    console.log('🔍 Report useEffect triggered:', { authLoading, userId: user?.id, hasUser: !!user })
    
    if (!authLoading && !user) {
      console.log('🔀 Report: No user, redirecting to auth')
      router.push('/auth')
      return
    }

    if (user && !authLoading) {
      console.log('👤 Report: User found, fetching report')
      fetchReport()
    }
  }, [user, authLoading, fetchReport, router]) // 保持依赖项完整

  const handleUpgrade = async () => {
    if (!report?.id) {
      alert('Report not found')
      return
    }

    try {
      console.log('[Report] Creating payment checkout for report:', report.id)
      setLoading(true)
      
      // Call API to create checkout session
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportId: report.id
        })
      })

      const data = await response.json()

      if (!data.success || !data.checkoutUrl) {
        throw new Error(data.error || 'Failed to create payment session')
      }

      console.log('[Report] Checkout created, redirecting to:', data.checkoutUrl)
      
      // Redirect to Creem checkout page
      window.location.href = data.checkoutUrl
      
    } catch (error) {
      console.error('[Report] Error creating checkout:', error)
      alert('Failed to start payment process. Please try again.')
      setLoading(false)
    }
  }


  if (authLoading || loading) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading your cosmic report...</p>
        </div>
      </div>
    )
  }

  if (!user || !report) {
    return null // Will redirect
  }

  // 解析报告内容，将Markdown格式转换为可显示的内容
  const parseReportContent = (content: string) => {
    if (!content) return ''
    
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mb-6 border-b border-purple-500/30 pb-2">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-purple-300 mb-4 mt-8">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-purple-200 mb-3 mt-6">$1</h3>')
      .replace(/^\- (.*$)/gim, '<li class="flex items-start gap-2 text-gray-300 mb-2"><div class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div><span>$1</span></li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-200 font-semibold">$1</strong>')
      .replace(/\n\n/g, '</p><p class="text-gray-200 leading-relaxed mb-4">')
      .replace(/^(?!<[h|l])/gm, '<p class="text-gray-200 leading-relaxed mb-4">')
      .replace(/<p class="text-gray-200 leading-relaxed mb-4"><\/p>/g, '')
  }

  // 获取报告内容
  const getReportContent = () => {
    if (!report) return ''
    
    // 如果有预览报告且未付费，显示预览
    if (!report.is_paid && report.preview_report) {
      return report.preview_report
    }
    
    // 如果有完整报告，显示完整报告
    if (report.full_report) {
      return report.full_report
    }
    
    // 如果没有报告内容，显示默认内容
    return `# 您的命理概览

## 出生信息
- 出生日期：${report.birth_date}
- 出生时间：${report.birth_time || '未知'}
- 性别：${report.gender === 'male' ? '男' : '女'}
- 时区：${report.timezone}

## 报告状态
${report.is_paid ? '✅ 完整版报告' : '📋 预览版报告'}

${!report.is_paid ? `

**想要了解更多详细内容吗？**

完整报告包含：
- 深度人格分析和成长建议
- 详细职业规划和财富策略  
- 全面感情分析和最佳配对
- 人生使命和关键转折点
- 个性化健康养生方案
- 以及更多专属于您的命理指导...

立即解锁完整报告，开启您的命运探索之旅！` : ''}`
  }

  return (
    <div className="cosmic-bg min-h-screen">
      <DebugInfo />
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                console.log('🔙 Report: Back button clicked')
                console.log('🔙 Report: Using Next.js router.push() for client-side navigation')
                router.push('/dashboard')
              }}
              className="text-purple-300 hover:text-purple-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Report Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-glow bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                {report.name || 'Your Cosmic Destiny Report'}
              </h1>
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-xl text-gray-300 mb-6">
              A personalized journey through your stars and potential
            </p>

            {/* Birth Info */}
            <div className="flex items-center justify-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(report.birth_date).toLocaleDateString()}</span>
              </div>
              {report.birth_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{report.birth_time}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{report.timezone}</span>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="space-y-8">
            {!report.is_paid ? (
              // 未付费：显示预览内容和升级提示
              <>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
                  <div className="prose prose-invert max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: parseReportContent(getReportContent()) 
                      }}
                    />
                  </div>
                </div>
                
                {/* Upgrade Card */}
                <div className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-purple-900/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Unlock Your Complete Destiny Report
                    </h3>
                    <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                      The preview shows only a glimpse of your destiny analysis. The full report includes in-depth personality insights, detailed career guidance, comprehensive relationship advice, life purpose interpretation, and personalized health recommendations - over 3,000 words of content tailored exclusively for you.
                    </p>
                    <Button
                      onClick={handleUpgrade}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Unlock Full Report Now
                    </Button>
                    <p className="text-sm text-gray-400 mt-4">
                      One-time payment, lifetime access
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // 已付费：显示完整的报告内容
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
                <div className="prose prose-invert max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: parseReportContent(getReportContent()) 
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Report Footer */}
          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm mb-4">
              Generated on {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 主页面组件，用Suspense包装
export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading your cosmic report...</p>
        </div>
      </div>
    }>
      <ReportContent />
    </Suspense>
  )
}
