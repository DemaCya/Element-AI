'use client'

import React, { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/contexts/SupabaseContext'
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

function DashboardContent() {
  const { user, profile, signOut, loading: authLoading } = useUser()
  const supabase = useSupabase()
  const router = useRouter()
  
  const [reports, setReports] = useState<UserReport[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // 如果还在加载用户，等待
    if (authLoading) return
    
    // 如果没有用户，跳转到登录页
    if (!user) {
      router.push('/auth')
      return
    }

    // 有用户了，开始加载报告
    let mounted = true
    setLoadingReports(true)
    
    // 超时保护：3秒后强制结束loading
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('⚠️ Reports loading timeout')
        setLoadingReports(false)
      }
    }, 3000)

    async function fetchReports() {
      try {
        const { data, error } = await supabase
          .from('user_reports')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })

        if (!mounted) return
        
        if (error) {
          console.error('❌ Failed to fetch reports:', error)
          setReports([])
        } else {
          setReports(data || [])
        }
      } catch (error) {
        if (!mounted) return
        console.error('❌ Exception fetching reports:', error)
        setReports([])
      } finally {
        if (mounted) {
          clearTimeout(timeout)
          setLoadingReports(false)
        }
      }
    }

    fetchReports()
    
    return () => {
      mounted = false
      clearTimeout(timeout)
    }
  }, [user, authLoading, supabase, router])

  const handleBirthFormSubmit = async (birthData: any) => {
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

  // 简化的加载逻辑：只看 authLoading
  if (authLoading) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-white text-sm">Verifying session...</p>
        </div>
      </div>
    )
  }

  // authLoading 完成后，如果没有用户，会被重定向
  if (!user) {
    return null
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

              {loadingReports ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">Loading reports...</p>
                </div>
              ) : reports.length === 0 ? (
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