'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useSupabase } from '@/contexts/SupabaseContext'
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
  Sparkles,
  Calendar,
  Clock,
  Globe
} from 'lucide-react'
import { Database } from '@/lib/database.types'
import { PostgrestError } from '@supabase/supabase-js'

type CosmicReport = Database['public']['Tables']['user_reports']['Row']

// 使用useSearchParams的组件
function ReportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useUser()
  const [report, setReport] = useState<CosmicReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false) // 新增状态，用于验证支付
  const [pageLoadId] = useState(() => `page-load-${Date.now()}`) // 用于追踪日志
  const supabase = useSupabase()

  useEffect(() => {
    const logPrefix = `[${pageLoadId}]`
    console.log(`${logPrefix} 🟢 ReportContent MOUNTED.`)
    return () => {
      console.log(`${logPrefix} 🔴 ReportContent UNMOUNTED.`)
    }
  }, [pageLoadId])

  const fetchReport = useCallback(async (isRetry = false): Promise<CosmicReport | null> => {
    const reportId = searchParams.get('id')
    const logPrefix = `[${pageLoadId}]`
    
    // 只有在第一次加载时才记录日志
    if (!isRetry) {
      console.log(`${logPrefix} 📄 Report: fetchReport called with:`, { reportId, userId: user?.id })
    }
    
    if (!reportId) {
      console.log(`${logPrefix} ❌ Report: No report ID, redirecting to dashboard`)
      setLoading(false)
      router.push('/dashboard')
      return null // 返回 null 表示失败
    }
    
    if (!user) {
      // 只有在第一次加载时才记录日志
      if (!isRetry) console.log(`${logPrefix} ⏳ Report: No user yet, waiting...`)
      return null // 返回 null 表示失败
    }

    try {
      // 第一次加载时显示全屏加载动画
      if (!isRetry) {
        console.log(`${logPrefix} 🔍 Report: Starting to fetch report with ID:`, reportId, 'for user:', user.id)
        setLoading(true)
      }
      
      console.log(`${logPrefix} ⏱️ Report: Starting Supabase query at ${new Date().toISOString()}`)
      const queryStartTime = Date.now()

      const { data, error }: { data: CosmicReport | null; error: PostgrestError | null } = await supabase
        .from('user_reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .single()
      
      const queryEndTime = Date.now()
      console.log(`${logPrefix} ⏱️ Report: Supabase query finished at ${new Date().toISOString()}`)
      console.log(`${logPrefix} ⏱️ Report: Query duration: ${queryEndTime - queryStartTime} ms`)
      
      console.log(`${logPrefix} 📬 Report: Response received`, { hasData: !!data, hasError: !!error, is_paid: data?.is_paid })

      if (error) {
        if (!isRetry) {
          console.error(`${logPrefix} ❌ Report: Error fetching report:`, error)
          console.error(`${logPrefix} ❌ Report: Error details:`, JSON.stringify(error))
          alert('Could not load report, returning to dashboard. Error: ' + error.message)
          router.push('/dashboard')
        }
        return null // 在重试时返回 null 表示失败
      }

      if (!data) {
        if (!isRetry) {
          console.error(`${logPrefix} ❌ Report: No data returned`)
          alert('Report not found or you do not have permission to view it')
          router.push('/dashboard')
        }
        return null // 在重试时返回 null
      }

      // 只有在第一次加载时才记录成功日志
      if (!isRetry) {
        console.log(`${logPrefix} ✅ Report: Report fetched successfully`, data)
      }
      
      setReport(data)
      return data // 返回获取到的报告数据

    } catch (error) {
      if (!isRetry) {
        console.error(`${logPrefix} ❌ Report: Exception while fetching report:`, error)
        console.error(`${logPrefix} ❌ Report: Exception details:`, JSON.stringify(error, Object.getOwnPropertyNames(error)))
        alert('Error loading report, returning to dashboard. Error: ' + (error instanceof Error ? error.message : String(error)))
        router.push('/dashboard')
      }
      return null // 在重试时返回 null
    } finally {
      // 确保只有在非重试的主流程中才停止全屏加载
      if (!isRetry) {
        setLoading(false)
      }
    }
  }, [searchParams, user?.id, supabase, router, pageLoadId])

  useEffect(() => {
    const logPrefix = `[${pageLoadId}]`
    console.log(`${logPrefix} 🔍 Report useEffect triggered:`, { authLoading, userId: user?.id, hasUser: !!user, reportId: searchParams.get('id'), url: window.location.href })
    
    if (!authLoading && !user) {
      console.log(`${logPrefix} 🔀 Report: No user and not loading, redirecting to auth`)
      router.push('/auth')
      return
    }

    if (user && !authLoading) {
      console.log(`${logPrefix} 👤 Report: User found, starting initial fetch`)
      fetchReport().then(fetchedReport => {
        // 检查是否从支付成功页面跳转过来（通过URL参数判断）
        const fromPayment = searchParams.get('from') === 'payment'
        
        console.log(`${logPrefix} Initial fetch completed.`, {
            isPaid: fetchedReport?.is_paid,
            fromPayment: fromPayment
        });
        
        // 只有在从支付页面跳转过来且报告未支付时，才进行支付验证轮询
        if (fetchedReport && !fetchedReport.is_paid && fromPayment) {
          console.log(`${logPrefix} ✅ Report: Conditions met. Starting payment verification polling...`)
          setIsVerifying(true)
          
          let attempts = 0
          const maxAttempts = 15 // 增加到15次 (45秒)
          const initialDelay = 1000 // 第一次检查延迟1秒
          const intervalTime = 3000 // 后续每3秒检查一次

          const pollingLogic = async () => {
            attempts++
            console.log(`${logPrefix} 🔄 Report: Polling attempt #${attempts}`)
            
            const updatedReport = await fetchReport(true) // true表示是重试
            
            if (updatedReport?.is_paid) {
                clearInterval(interval)
                setIsVerifying(false)
                console.log(`${logPrefix} ✅ Report: Payment verified via polling!`)
            } else if (attempts >= maxAttempts) {
              clearInterval(interval)
              setIsVerifying(false)
              console.log(`${logPrefix} ❌ Report: Polling finished after ${maxAttempts} attempts, report is still unpaid.`)
              alert("We couldn't confirm your payment automatically. Please wait a few minutes and refresh the page, or contact support if the issue persists.")
            }
          };

          let interval: NodeJS.Timeout;
          // 第一次快速检查
          setTimeout(() => {
            pollingLogic();
            // 然后设置定期检查
            interval = setInterval(pollingLogic, intervalTime);
          }, initialDelay);
        } else {
            console.log(`${logPrefix} ℹ️ Report: Conditions for polling not met.`, {
                hasReport: !!fetchedReport,
                isPaid: fetchedReport?.is_paid,
                fromPayment: fromPayment
            });
        }
      })
    }
  }, [user?.id, authLoading, fetchReport, router, searchParams, pageLoadId])

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
        console.error('[Report] Failed to create checkout session:', data.error)
        const errorMessage = data.error || 'Failed to create payment session'
        throw new Error(errorMessage)
      }

      console.log('[Report] Checkout created, redirecting to:', data.checkoutUrl)
      
      // Redirect to Creem checkout page
      window.location.href = data.checkoutUrl
      
    } catch (error) {
      console.error('[Report] Error creating checkout:', error)
      const displayError = error instanceof Error ? error.message : 'An unknown error occurred.'
      alert(`Failed to start payment process. Please try again.\n\nError: ${displayError}`)
      setLoading(false)
    }
  }


  if (authLoading || loading) {
    console.log(`[${pageLoadId}] 🌀 Showing loading screen. State:`, { authLoading, loading, isVerifying });
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
    console.log(`[${pageLoadId}] ❓ No user or report, rendering null for redirect. State:`, { hasUser: !!user, hasReport: !!report });
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
    
    // 如果正在验证支付，插入一个提示
    if (isVerifying) {
      return `# Verifying Payment Status...
      
## Please Wait
We are confirming your payment information. This usually takes a few seconds. The page will refresh automatically.`
    }

    // 如果有预览报告且未付费，显示预览
    if (!report.is_paid && report.preview_report) {
      return report.preview_report
    }
    
    // 如果有完整报告，显示完整报告
    if (report.full_report) {
      return report.full_report
    }
    
    // 如果没有报告内容，显示默认内容
    return `# Your Astrological Overview

## Birth Information
- Birth Date: ${report.birth_date}
- Birth Time: ${report.birth_time || 'Unknown'}
- Gender: ${report.gender === 'male' ? 'Male' : 'Female'}
- Timezone: ${report.timezone}

## Report Status
${report.is_paid ? '✅ Full Report' : '📋 Preview Report'}

${!report.is_paid ? `

**Want to unlock more details?**

The full report includes:
- In-depth personality analysis and growth advice
- Detailed career planning and wealth strategies  
- Comprehensive relationship analysis and best matches
- Life mission and key turning points
- Personalized health and wellness plan
- And much more guidance tailored to your destiny...

Unlock the full report now to begin your journey of cosmic discovery!` : ''}`
  }

  return (
    <div className="cosmic-bg min-h-screen">
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
          <div className="relative">
            {!report.is_paid ? (
              // 未付费：显示预览内容和局部毛玻璃遮罩
              <div className="relative">
                {/* 报告内容区域 */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20 relative overflow-hidden">
                  <div className="prose prose-invert max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: parseReportContent(getReportContent()) 
                      }}
                    />
                  </div>
                  
                  {/* 毛玻璃遮罩 - 只遮住下半部分 */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 via-transparent to-transparent backdrop-blur-xl pointer-events-none"></div>
                  
                  {/* 升级提示框 - 覆盖在毛玻璃上 */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
                    <div className="bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
                      <div className="text-center">
                        <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-white mb-3">
                          Unlock Your Complete Destiny Report
                        </h3>
                        <p className="text-gray-200 mb-4 text-sm leading-relaxed">
                          The preview shows only a glimpse of your destiny analysis. The full report includes in-depth personality insights, detailed career guidance, comprehensive relationship advice, life purpose interpretation, and personalized health recommendations.
                        </p>
                        
                        {/* 购买按钮 */}
                        <Button
                          onClick={handleUpgrade}
                          className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 text-base font-semibold rounded-lg shadow-lg transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-purple-500/50 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:shadow-lg group mb-3"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <span className="relative flex items-center justify-center">
                            <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                            Unlock Full Report Now
                          </span>
                        </Button>
                        
                        {/* 底部链接 */}
                        <div className="text-xs">
                          <button 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="text-white/70 hover:text-white underline transition-colors"
                          >
                            Already purchased? Read now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
