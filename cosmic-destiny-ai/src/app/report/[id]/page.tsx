'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Star,
  Moon,
  Sun,
  Zap,
  Heart,
  Briefcase,
  Compass,
  Download,
  Share,
  Sparkles,
  Calendar,
  Clock,
  Globe,
  User
} from 'lucide-react'

interface CosmicReport {
  id: string
  name?: string
  birth_date: string
  birth_time?: string
  timezone: string
  gender: string
  is_paid: boolean
  created_at: string
  report_data?: {
    personality?: {
      overview: string
      strengths: string[]
      challenges: string[]
    }
    career?: {
      bestPaths: string[]
      timing: string
    }
    relationships?: {
      compatibility: string
      advice: string
    }
    lifePath?: {
      purpose: string
      challenges: string
    }
    health?: {
      considerations: string[]
      advice: string
    }
  }
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const supabase = createClient()
  const [report, setReport] = useState<CosmicReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }

    fetchReport()
  }, [user, authLoading, router, params.id])

  const handleUpgrade = async () => {
    try {
      // TODO: 这里应该先处理支付流程
      // 现在为了测试，直接调用升级API
      
      const response = await fetch(`/api/reports/${params.id}/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upgrade report')
      }

      // 刷新页面显示完整报告
      fetchReport()
    } catch (error) {
      console.error('Error upgrading report:', error)
      alert('Failed to upgrade report. Please try again.')
    }
  }

  const fetchReport = async () => {
    try {
      // Fetch report from API
      const response = await fetch(`/api/reports/${params.id}`)
      const result = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard')
          return
        }
        throw new Error(result.error || 'Failed to fetch report')
      }

      // Transform the report data to match our interface
      const reportData = result.report
      const cosmicReport: CosmicReport = {
        id: reportData.id,
        name: reportData.name,
        birth_date: reportData.birth_date,
        birth_time: reportData.birth_time || undefined,
        timezone: reportData.timezone,
        gender: reportData.gender,
        is_paid: reportData.is_paid,
        created_at: reportData.created_at,
        report_data: reportData.is_paid ? reportData.full_report : reportData.preview_report
      }

      setReport(cosmicReport)
    } catch (error) {
      console.error('Error fetching report:', error)
      router.push('/dashboard')
    } finally {
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

  // 检查报告数据格式
  const isNewFormat = typeof report.report_data === 'string'
  const reportData = isNewFormat ? null : report.report_data

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
                        __html: parseReportContent(report.report_data as string) 
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
            ) : isNewFormat ? (
              // 新格式：显示完整的报告内容
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
                <div className="prose prose-invert max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: parseReportContent(report.report_data as string) 
                    }}
                  />
                </div>
              </div>
            ) : (
              // 旧格式：分段显示（向后兼容）
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Personality Overview</h2>
                </div>
                <p className="text-gray-200 leading-relaxed mb-6">
                  {reportData?.personality?.overview || 'Personality analysis not available'}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Your Strengths</h3>
                    <ul className="space-y-2">
                      {reportData?.personality?.strengths?.map((strength, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Growth Opportunities</h3>
                    <ul className="space-y-2">
                      {reportData?.personality?.challenges?.map((challenge, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 旧格式的其他部分（向后兼容） */}
            {!isNewFormat && (
              <>
                {/* Career Guidance */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Career Guidance</h2>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-3">Best Career Paths</h3>
                <div className="flex flex-wrap gap-2">
                  {reportData?.career?.bestPaths?.map((path, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {path}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-300 mb-3">Cosmic Timing</h3>
                <p className="text-gray-200 leading-relaxed">
                  {reportData?.career?.timing}
                </p>
              </div>
            </div>

            {/* Relationships */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Relationship Insights</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Compatibility</h3>
                  <p className="text-gray-200 leading-relaxed">
                    {reportData?.relationships?.compatibility}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Relationship Advice</h3>
                  <p className="text-gray-200 leading-relaxed">
                    {reportData?.relationships?.advice}
                  </p>
                </div>
              </div>
            </div>

            {/* Life Path */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Compass className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Life Purpose & Path</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Soul's Purpose</h3>
                  <p className="text-gray-200 leading-relaxed">
                    {reportData?.lifePath?.purpose}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Life Lessons</h3>
                  <p className="text-gray-200 leading-relaxed">
                    {reportData?.lifePath?.challenges}
                  </p>
                </div>
              </div>
            </div>

            {/* Health & Wellness */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Health & Wellness</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Considerations</h3>
                  <ul className="space-y-2">
                    {reportData?.health?.considerations?.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Wellness Advice</h3>
                  <p className="text-gray-200 leading-relaxed">
                    {reportData?.health?.advice}
                  </p>
                </div>
              </div>
            </div>
              </>
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