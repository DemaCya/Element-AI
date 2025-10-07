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
  report_data?: string | {
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

  const fetchReport = async () => {
    try {
      // 生成静态演示报告
      const mockReport: CosmicReport = {
        id: params.id,
        name: '演示命理报告',
        birth_date: '1990-01-01',
        birth_time: '12:00',
        timezone: 'Asia/Shanghai',
        gender: 'male',
        is_paid: false,
        created_at: new Date().toISOString(),
        report_data: `# 您的命理概览

## 出生信息
- 出生日期：1990-01-01
- 出生时间：12:00 (系统默认)
- 性别：男

## 核心性格特征
基于您的八字分析，您的日主为甲，这赋予了您独特的个性魅力。您是一个充满智慧和创造力的人，善于观察和思考，总能在细节中发现别人忽视的价值。您的内心深处有着对完美的追求，这使您在做事时格外认真细致。同时，您具有很强的直觉力和同理心，能够敏锐地感知他人的情绪变化。

## 天赋潜能
您最突出的天赋在于创新思维和沟通能力。您天生具有将复杂概念简单化的能力，善于用独特的视角解决问题。在艺术创作、策略规划或人际交往方面，您都展现出超乎常人的天赋。特别是在需要创意和灵感的领域，您总能迸发出令人惊喜的想法。

## 事业方向
根据您的五行配置，最适合您的职业方向是创意产业和知识服务业。设计、媒体、教育、咨询等需要创造力和沟通能力的行业都很适合您。您也适合担任团队的智囊角色，为组织提供战略性建议。创业也是不错的选择，特别是在文化创意或科技创新领域。

## 感情运势
在感情方面，您追求心灵层面的共鸣。您需要一个能够理解您内心世界、与您进行深度交流的伴侣。您的感情表达方式含蓄而深情，更喜欢用行动而非言语来表达爱意。建议您在选择伴侣时，重视精神契合度，寻找能够共同成长的人生伴侣。

---

**想要了解更多详细内容吗？**

完整报告包含：
- 深度人格分析和成长建议
- 详细职业规划和财富策略  
- 全面感情分析和最佳配对
- 人生使命和关键转折点
- 个性化健康养生方案
- 以及更多专属于您的命理指导...

立即解锁完整报告，开启您的命运探索之旅！`
      }

      setReport(mockReport)
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
  const reportData = isNewFormat ? null : (report.report_data as any)

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
                      {reportData?.personality?.strengths?.map((strength: any, index: any) => (
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
                      {reportData?.personality?.challenges?.map((challenge: any, index: any) => (
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
                  {reportData?.career?.bestPaths?.map((path: any, index: any) => (
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
                    {reportData?.health?.considerations?.map((item: any, index: any) => (
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