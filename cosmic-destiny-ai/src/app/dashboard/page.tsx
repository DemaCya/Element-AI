'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/Navigation'
import BirthForm from '@/components/BirthForm'
import { Calendar, FileText, CreditCard, User, LogOut, Sparkles } from 'lucide-react'

interface UserReport {
  id: string
  name?: string
  birth_date: string
  timezone: string
  is_paid: boolean
  created_at: string
}

export default function Dashboard() {
  const { user, profile, signOut, loading: authLoading } = useUser()
  const [reports, setReports] = useState<UserReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Listen for open birth form event from navigation
    const handleOpenBirthForm = () => {
      setShowForm(true)
    }

    window.addEventListener('openBirthForm', handleOpenBirthForm)

    return () => {
      window.removeEventListener('openBirthForm', handleOpenBirthForm)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      fetchReports()
    }
  }, [user, authLoading, router])

  const fetchReports = async () => {
    if (!user) {
      console.log('No user, skipping fetchReports')
      setLoading(false)
      return
    }

    try {
      console.log('Fetching reports for user:', user.id)
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reports:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return
      }

      console.log('Fetched reports:', data)
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBirthFormSubmit = async (birthData: any) => {
    if (!user) {
      console.error('No user found, cannot create report')
      return
    }

    // 持久化日志记录
    const logToStorage = (message: string, data?: any) => {
      const timestamp = new Date().toISOString()
      const logEntry = { timestamp, message, data }
      console.log(`[${timestamp}] ${message}`, data)
      
      // 保存到localStorage以便查看
      const existingLogs = JSON.parse(localStorage.getItem('reportCreationLogs') || '[]')
      existingLogs.push(logEntry)
      localStorage.setItem('reportCreationLogs', JSON.stringify(existingLogs.slice(-50))) // 只保留最近50条
    }

    logToStorage("=== 开始创建报告 ===")
    logToStorage("用户信息", { id: user.id, email: user.email })
    logToStorage("报告数据", birthData)

    try {
      // 生成模拟报告内容
      const mockPreviewReport = `# 您的命理概览

## 出生信息
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '未知'}
- 性别：${birthData.gender === 'male' ? '男' : '女'}
- 时区：${birthData.timeZone}

## 核心性格特征
基于您的八字分析，您的日主为甲，这赋予了您独特的个性魅力。您是一个充满智慧和创造力的人，善于观察和思考，总能在细节中发现别人忽视的价值。您的内心深处有着对完美的追求，这使您在做事时格外认真细致。同时，您具有很强的直觉力和同理心，能够敏锐地感知他人的情绪变化。

## 天赋潜能
您最突出的天赋在于创新思维和沟通能力。您天生具有将复杂概念简单化的能力，善于用独特的视角解决问题。在艺术创作、策略规划或人际交往方面，您都展现出超乎常人的天赋。特别是在需要创意和灵感的领域，您总能迸发出令人惊喜的想法。

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

      const mockFullReport = mockPreviewReport + `

## 完整版内容（付费解锁）

### 详细职业规划
根据您的五行配置，最适合您的职业方向是创意产业和知识服务业。设计、媒体、教育、咨询等需要创造力和沟通能力的行业都很适合您。您也适合担任团队的智囊角色，为组织提供战略性建议。创业也是不错的选择，特别是在文化创意或科技创新领域。

### 感情运势分析
在感情方面，您追求心灵层面的共鸣。您需要一个能够理解您内心世界、与您进行深度交流的伴侣。您的感情表达方式含蓄而深情，更喜欢用行动而非言语来表达爱意。建议您在选择伴侣时，重视精神契合度，寻找能够共同成长的人生伴侣。

### 健康养生建议
您的体质偏向于需要平衡的调理。建议多进行户外活动，保持心情愉悦，避免过度思虑。在饮食方面，多食用新鲜蔬果，少食辛辣刺激食物。定期进行冥想或瑜伽练习，有助于平衡身心。`

      // 创建报告记录
      logToStorage('=== 准备插入数据库 ===')
      logToStorage('用户ID', user.id)
      logToStorage('Supabase客户端', supabase)
      
      const reportInsertData = {
        user_id: user.id,
        name: birthData.reportName || `命理报告 - ${new Date(birthData.birthDate).toLocaleDateString()}`,
        birth_date: birthData.birthDate,
        birth_time: birthData.birthTime || null,
        timezone: birthData.timeZone,
        gender: birthData.gender,
        is_time_known_input: birthData.isTimeKnownInput,
        is_paid: false,
        bazi_data: {
          // 模拟八字数据
          heavenlyStems: ['甲', '乙', '丙', '丁'],
          earthlyBranches: ['子', '丑', '寅', '卯'],
          dayMaster: '甲',
          elements: { wood: 2, fire: 1, earth: 1, metal: 1, water: 1 }
        },
        full_report: mockFullReport,
        preview_report: mockPreviewReport
      }
      
      logToStorage('插入数据', reportInsertData)
      logToStorage('开始执行数据库插入...')

      const { data: reportData, error: reportError } = await supabase
        .from('user_reports')
        .insert(reportInsertData)
        .select()
        .single()

      logToStorage('=== 数据库操作完成 ===')
      logToStorage('返回数据', reportData)
      logToStorage('错误信息', reportError)

      if (reportError) {
        logToStorage('=== 数据库插入失败 ===')
        logToStorage('Error creating report', reportError)
        logToStorage('Error details', {
          message: reportError.message,
          details: reportError.details,
          hint: reportError.hint,
          code: reportError.code
        })
        alert(`创建报告失败: ${reportError.message}`)
        return
      }

      logToStorage('=== 报告创建成功 ===')
      logToStorage('报告数据', reportData)
      logToStorage('报告ID', reportData.id)

      // 重新获取报告列表
      logToStorage('开始重新获取报告列表...')
      await fetchReports()
      logToStorage('报告列表获取完成')
      
      // 重定向到报告页面
      logToStorage('准备重定向到报告页面', `/report?id=${reportData.id}`)
      router.push(`/report?id=${reportData.id}`)
      logToStorage('重定向完成')
    } catch (error) {
      logToStorage('=== 捕获到异常 ===')
      logToStorage('Error creating report', error)
      logToStorage('Error stack', error instanceof Error ? error.stack : 'No stack trace')
      logToStorage('Error message', error instanceof Error ? error.message : String(error))
      alert(`生成报告失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      logToStorage('=== 清理状态 ===')
      setShowForm(false)
      logToStorage('表单已关闭')
    }
  }

  const handleReportClick = (reportId: string) => {
    router.push(`/report?id=${reportId}`)
  }

  // 添加查看日志的辅助函数（开发调试用）
  const viewLogs = () => {
    const logs = JSON.parse(localStorage.getItem('reportCreationLogs') || '[]')
    console.log('=== 持久化日志 ===')
    logs.forEach((log: any) => {
      console.log(`[${log.timestamp}] ${log.message}`, log.data)
    })
    return logs
  }

  // 在window对象上添加查看日志的方法（开发调试用）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).viewReportLogs = viewLogs
    }
  }, [])

  if (authLoading || loading) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth
  }

  return (
    <div className="cosmic-bg min-h-screen">
      <Navigation user={user} profile={profile} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-glow mb-4">
              Welcome to Your Cosmic Dashboard
            </h1>
            <p className="text-xl text-gray-300">
              Your journey to self-discovery continues here
            </p>
          </div>

          {/* User Info */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {profile?.full_name || user.email}
                  </h2>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={signOut}
                className="text-red-400 border-red-400 hover:bg-red-400/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Reports Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* My Reports */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-400" />
                My Reports
              </h3>

              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400 mb-4">No reports yet</p>
                  <Button
                    variant="cosmic"
                    onClick={() => setShowForm(true)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Your First Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/10 hover:border-purple-500/30 transition-colors cursor-pointer"
                      onClick={() => handleReportClick(report.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <span className="text-white font-medium">
                              {report.name || `命理报告 - ${new Date(report.birth_date).toLocaleDateString()}`}
                            </span>
                            {report.is_paid && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                Premium
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">
                            {report.timezone} • {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <FileText className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-6">
              {/* Create New Report */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-bold text-white mb-4">Create New Report</h3>
                <p className="text-gray-400 mb-4">
                  Generate a new cosmic destiny analysis based on your birth information
                </p>
                <Button
                  variant="cosmic"
                  className="w-full"
                  onClick={() => setShowForm(true)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Chart My Cosmos
                </Button>
              </div>

              {/* Upgrade */}
              {!reports.some(r => r.is_paid) && reports.length > 0 && (
                <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-yellow-400" />
                    Unlock Full Report
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Access your complete destiny analysis with detailed insights and predictions
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                  >
                    Upgrade for $19.99
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Birth Form Modal */}
      {showForm && (
        <BirthForm
          onSubmit={handleBirthFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}