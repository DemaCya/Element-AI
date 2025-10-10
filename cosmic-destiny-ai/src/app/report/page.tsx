'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

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
  const supabase = createClient()

  const fetchReport = useCallback(async () => {
    const reportId = searchParams.get('id')
    
    console.log('🔍 fetchReport called with:', { reportId, user: user?.id })
    
    if (!reportId || !user) {
      console.log('No report ID or user, redirecting to dashboard')
      setLoading(false)
      router.push('/dashboard')
      return
    }

    try {
      console.log('Fetching report with ID:', reportId)
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching report:', error)
        setLoading(false)
        router.push('/dashboard')
        return
      }

      console.log('Report fetched successfully:', data)
      setReport(data)
    } catch (error) {
      console.error('Error fetching report:', error)
      setLoading(false)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [searchParams, user, supabase, router])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      fetchReport()
    }
  }, [user, authLoading, router, fetchReport])

  const handleUpgrade = async () => {
    try {
      // 模拟升级过程（静态模式）
      console.log('模拟升级报告...')
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 更新报告状态为已付费
      setReport(prev => prev ? { ...prev, is_paid: true } : null)
      
      alert('报告已升级为完整版！')
    } catch (error) {
      console.error('Error upgrading report:', error)
      alert('Failed to upgrade report. Please try again.')
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
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
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
                
                {/* 升级提示卡片 */}
                <div className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-purple-900/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      解锁您的完整命理报告
                    </h3>
                    <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                      预览仅展示了您命理分析的一小部分。完整报告包含深度人格分析、详细职业规划、
                      全面感情指导、人生使命解读和个性化健康养生方案，总计超过3000字的专属内容。
                    </p>
                    <Button
                      onClick={handleUpgrade}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      立即解锁完整报告
                    </Button>
                    <p className="text-sm text-gray-400 mt-4">
                      一次付费，终身查看
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
            {!report.is_paid && (
              <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-2">Unlock Full Report</h3>
                <p className="text-gray-300 mb-4">
                  Get access to detailed predictions, monthly forecasts, and personalized recommendations
                </p>
                <Button variant="cosmic">
                  Upgrade to Premium - $19.99
                </Button>
              </div>
            )}
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
