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
  const [streamingContent, setStreamingContent] = useState<string>('') // 流式传输的内容
  const [isStreaming, setIsStreaming] = useState(false) // 是否正在流式传输
  const [isStreamComplete, setIsStreamComplete] = useState(false) // 流式传输是否完成
  const [autoScroll, setAutoScroll] = useState(false) // 是否自动滚动（默认关闭）
  const contentContainerRef = React.useRef<HTMLDivElement>(null) // 内容容器引用
  const supabase = useSupabase()

  // 预览边界（字符数）
  const PREVIEW_BOUNDARY = 1800

  

  useEffect(() => {
    const logPrefix = `[${pageLoadId}]`
    console.log(`${logPrefix} 🟢 ReportContent MOUNTED.`)
    return () => {
      console.log(`${logPrefix} 🔴 ReportContent UNMOUNTED.`)
    }
  }, [pageLoadId])

  // 关闭自动滚动：保留占位但不执行滚动
  useEffect(() => {
    // intentionally disabled auto-scroll during streaming
  }, [streamingContent, autoScroll, isStreaming])

  // 检测用户手动滚动
  const handleScroll = () => {
    // auto-scroll disabled; user controls scrolling
  }

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

  // 启动流式传输（依赖 fetchReport，放在其后定义）
  const startStreaming = useCallback(async (reportId: string) => {
    try {
      setIsStreaming(true)
      
      // 从sessionStorage获取birthData
      const birthDataStr = sessionStorage.getItem(`birthData_${reportId}`)
      if (!birthDataStr) {
        console.error('❌ [Report] No birthData found in sessionStorage')
        return
      }
      
      const birthData = JSON.parse(birthDataStr)
      
      // 发起流式请求
      const response = await fetch('/api/reports/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportId,
          birthData
        })
      })

      if (!response.ok) {
        throw new Error(`Stream API failed: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body reader')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('✅ [Report] Stream complete')
          setIsStreaming(false)
          setIsStreamComplete(true)
          // 清理sessionStorage
          sessionStorage.removeItem(`birthData_${reportId}`)
          // 重新获取报告数据
          await fetchReport(true)
          break
        }

        buffer += decoder.decode(value, { stream: true })
        
        // 处理SSE消息
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'chunk') {
                setStreamingContent(prev => {
                  const newContent = prev + data.content
                  return newContent
                })
                
                // 定期刷新报告数据（从数据库获取最新内容）
                if (data.totalLength % 5000 === 0) {
                  fetchReport(true)
                }
              } else if (data.type === 'done') {
                console.log('✅ [Report] Stream done, total length:', data.totalLength)
                setIsStreaming(false)
                setIsStreamComplete(true)
                sessionStorage.removeItem(`birthData_${reportId}`)
                await fetchReport(true)
              } else if (data.type === 'error') {
                console.error('❌ [Report] Stream error:', data.error)
                setIsStreaming(false)
                alert('流式传输出现错误: ' + data.error)
              }
            } catch (e) {
              console.error('❌ [Report] Failed to parse SSE message:', e, line)
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ [Report] Stream error:', error)
      setIsStreaming(false)
      alert('流式传输失败: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }, [fetchReport])

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
        if (!fetchedReport) return
        
        // 检查是否需要启动流式传输
        const shouldStream = searchParams.get('stream') === 'true'
        const reportId = searchParams.get('id')
        
        if (shouldStream && reportId && !fetchedReport.full_report) {
          console.log(`${logPrefix} 📡 Report: Starting streaming...`)
          startStreaming(reportId).catch(err => {
            console.error(`${logPrefix} ❌ Report: Failed to start streaming:`, err)
          })
        }
        
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
  }, [user?.id, authLoading, fetchReport, router, searchParams, pageLoadId, startStreaming])

  // （已前置定义）

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
      // 标题处理
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mb-6 border-b border-purple-500/30 pb-2">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-purple-300 mb-4 mt-8">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-purple-200 mb-3 mt-6">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold text-purple-100 mb-2 mt-4">$1</h4>')
      
      // 列表处理
      .replace(/^\- (.*$)/gim, '<li class="flex items-start gap-2 text-gray-300 mb-2"><div class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div><span>$1</span></li>')
      .replace(/^\* (.*$)/gim, '<li class="flex items-start gap-2 text-gray-300 mb-2"><div class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div><span>$1</span></li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="flex items-start gap-2 text-gray-300 mb-2"><span class="text-purple-400 font-semibold mr-2">$1</span></li>')
      
      // 文本格式处理
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-200 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-purple-100 italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-purple-900/50 text-purple-200 px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // 链接处理
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-purple-300 hover:text-purple-200 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // 分割线处理
      .replace(/^---$/gim, '<hr class="border-purple-500/30 my-6">')
      .replace(/^___$/gim, '<hr class="border-purple-500/30 my-6">')
      
      // 引用处理
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-purple-500/50 pl-4 py-2 bg-purple-900/20 text-gray-300 italic">$1</blockquote>')
      
      // 段落处理
      .replace(/\n\n/g, '</p><p class="text-gray-200 leading-relaxed mb-4">')
      .replace(/^(?!<[h|l|b|c|a|q])/gm, '<p class="text-gray-200 leading-relaxed mb-4">')
      .replace(/<p class="text-gray-200 leading-relaxed mb-4"><\/p>/g, '')
      
      // 清理多余的空段落
      .replace(/<p class="text-gray-200 leading-relaxed mb-4"><\/p>/g, '')
      .replace(/<p class="text-gray-200 leading-relaxed mb-4">\s*<\/p>/g, '')
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

    // 如果有流式内容，优先使用流式内容
    if (streamingContent) {
      // 如果是未付费用户，只显示预览版（前1800字符）
      if (!report.is_paid) {
        if (streamingContent.length <= PREVIEW_BOUNDARY) {
          return streamingContent + (isStreaming ? '\n\n*Generating...*' : '')
        } else {
          // 到达预览边界，停止显示新内容，但保持"正在生成中"提示
          const preview = streamingContent.substring(0, PREVIEW_BOUNDARY)
          return preview + (isStreaming ? '\n\n---\n\n**想要了解更多详细内容吗？**\n\n完整报告包含：\n- 深度人格分析和成长建议\n- 详细职业规划和财富策略\n- 全面感情分析和最佳配对\n- 人生使命和关键转折点\n- 个性化健康养生方案\n- 大运流年详细分析\n- 有利不利因素深度解读\n- 以及更多专属于您的命理指导...\n\n立即解锁完整报告，开启您的命运探索之旅！\n\n*Full report is being generated in the background...*' : '')
        }
      } else {
        // 已付费用户显示完整流式内容
        return streamingContent + (isStreaming ? '\n\n*Generating...*' : '')
      }
    }

    // 如果没有流式内容，使用数据库中的内容
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
          <div className="space-y-8">
            {/* 思考模式提示：在开始流式传输但尚未收到任何字符时显示 */}
            {isStreaming && !streamingContent && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 text-center">
                <div className="inline-flex items-center gap-3 text-purple-300">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-400 border-t-transparent"></div>
                  <span>The model is thinking; content will start shortly...</span>
                </div>
              </div>
            )}
            {!report.is_paid ? (
              // 未付费：显示预览内容和升级提示
              <>
                <div 
                  ref={contentContainerRef}
                  onScroll={handleScroll}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20"
                  style={{
                    minHeight: '400px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    transition: 'height 0.3s ease-out'
                  }}
                >
                  <div className="prose prose-invert max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: parseReportContent(getReportContent()) 
                      }}
                    />
                  </div>
                </div>
                
                {/* Streaming Indicator */}
                {isStreaming && (
                  <div className="text-center text-purple-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
                      <span>Generating report content...</span>
                    </div>
                  </div>
                )}
                
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
                      className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-purple-500/50 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:shadow-lg group"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative flex items-center justify-center">
                        <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                        Unlock Full Report Now
                      </span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // 已付费：显示完整的报告内容
              <div 
                ref={contentContainerRef}
                onScroll={handleScroll}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20"
                style={{
                  minHeight: '400px',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  transition: 'height 0.3s ease-out'
                }}
              >
                <div className="prose prose-invert max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: parseReportContent(getReportContent()) 
                    }}
                  />
                </div>
                {/* Streaming Indicator */}
                {isStreaming && (
                  <div className="mt-4 text-center text-purple-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
                      <span>Generating report content...</span>
                    </div>
                  </div>
                )}
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
