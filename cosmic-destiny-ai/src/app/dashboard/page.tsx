'use client'

import React, { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/contexts/SupabaseContext'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'

// 强制动态渲染
// 强制动态渲染 - Vercel部署触发
export const dynamic = 'force-dynamic'
import Navigation from '@/components/Navigation'
import BirthForm from '@/components/BirthForm'
import DebugInfo from '@/components/DebugInfo'
import { Calendar, FileText, CreditCard, User, LogOut, Sparkles } from 'lucide-react'

interface UserReport {
  id: string
  name?: string
  birth_date: string
  timezone: string
  is_paid: boolean
  created_at: string
}

// 使用useSearchParams的组件
function DashboardContent() {
  const { user, profile, signOut, loading: authLoading } = useUser()
  const [reports, setReports] = useState<UserReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useSupabase()

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

  // 测试Supabase连接
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔍 测试Supabase连接...')
        const { data, error } = await supabase.from('user_reports').select('count').limit(1)
        if (error) {
          console.error('❌ Supabase连接测试失败:', error)
          console.error('错误详情:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          
          // 如果是CORS错误，提供解决建议
          if (error.message.includes('Load failed') || error.message.includes('CORS')) {
            console.error('🚨 这可能是CORS问题！请检查Supabase Dashboard设置：')
            console.error('1. 进入 Settings → API')
            console.error('2. 在 Site URL 中添加你的Vercel域名')
            console.error('3. 在 Additional Redirect URLs 中添加你的域名')
          }
        } else {
          console.log('✅ Supabase连接测试成功:', data)
        }
      } catch (err) {
        console.error('❌ Supabase连接异常:', err)
      }
    }
    
    if (user) {
      testConnection()
    }
  }, [user, supabase])

  // Dashboard只负责显示报告列表，不再处理报告生成

  const fetchReports = useCallback(async () => {
    if (!user) {
      console.log('📊 Dashboard: No user, skipping fetchReports')
      setLoading(false)
      return
    }

    try {
      console.log('📊 Dashboard: Fetching reports for user:', user.id)
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Dashboard: Error fetching reports:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        setLoading(false)
        return
      }

      console.log('✅ Dashboard: Fetched reports:', data?.length, 'reports')
      setReports(data || [])
    } catch (error) {
      console.error('❌ Dashboard: Exception while fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase]) // 添加 supabase 到依赖项

  useEffect(() => {
    console.log('🔍 Dashboard useEffect triggered:', { authLoading, userId: user?.id, hasUser: !!user })
    
    if (!authLoading && !user) {
      console.log('🔀 Dashboard: No user, redirecting to auth')
      router.push('/auth')
      return
    }

    if (user && !authLoading) {
      console.log('👤 Dashboard: User found, fetching reports')
      fetchReports()
    }
  }, [user, authLoading, fetchReports, router]) // 保持依赖项完整

  // 处理从dashboard直接创建报告的情况
  const handleBirthFormSubmit = async (birthData: any) => {
    // 重定向到专门的报告生成页面
    const params = new URLSearchParams({
      birthDate: birthData.birthDate,
      birthTime: birthData.birthTime || '',
      timeZone: birthData.timeZone,
      gender: birthData.gender,
      isTimeKnownInput: birthData.isTimeKnownInput.toString(),
      reportName: birthData.reportName || ''
    })
    
    router.push(`/generate?${params.toString()}`)
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
      <DebugInfo />
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

// 主页面组件，用Suspense包装
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}