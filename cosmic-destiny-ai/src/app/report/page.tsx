'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useSupabase } from '@/contexts/SupabaseContext'
import { Button } from '@/components/ui/button'

// Force dynamic rendering
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

// Component using useSearchParams
function ReportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useUser()
  const [report, setReport] = useState<CosmicReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false) // New state for payment verification
  const [pageLoadId] = useState(() => `page-load-${Date.now()}`) // For tracking logs
  const [streamingContent, setStreamingContent] = useState<string>('') // Streaming content
  const [isStreaming, setIsStreaming] = useState(false) // Is streaming
  const [isStreamComplete, setIsStreamComplete] = useState(false) // Is stream complete
  const [autoScroll, setAutoScroll] = useState(false) // Auto scroll (disabled)
  const contentContainerRef = React.useRef<HTMLDivElement>(null) // Content container reference
  const supabase = useSupabase()

  // Preview boundary (character count)
  const PREVIEW_BOUNDARY = 3500

  

  useEffect(() => {
    const logPrefix = `[${pageLoadId}]`
    console.log(`${logPrefix} 🟢 ReportContent MOUNTED.`)
    return () => {
      console.log(`${logPrefix} 🔴 ReportContent UNMOUNTED.`)
    }
  }, [pageLoadId])

  // Auto-scroll disabled: placeholder logic retained but scrolling not executed
  useEffect(() => {
    // no-op when autoScroll is disabled
  }, [streamingContent, autoScroll, isStreaming])

  // Detect manual user scroll
  const handleScroll = () => {
    // When user scrolls manually, keep auto-scroll disabled
    if (autoScroll) setAutoScroll(false)
  }

  const fetchReport = useCallback(async (isRetry = false): Promise<CosmicReport | null> => {
    const reportId = searchParams.get('id')
    const logPrefix = `[${pageLoadId}]`
    
    // Log only on first load
    if (!isRetry) {
      console.log(`${logPrefix} 📄 Report: fetchReport called with:`, { reportId, userId: user?.id })
    }
    
    if (!reportId) {
      console.log(`${logPrefix} ❌ Report: No report ID, redirecting to dashboard`)
      setLoading(false)
      router.push('/dashboard')
      return null // return null indicates failure
    }
    
    if (!user) {
      // Log only on first load
      if (!isRetry) console.log(`${logPrefix} ⏳ Report: No user yet, waiting...`)
      return null // return null indicates failure
    }

    try {
      // Show full screen loading animation on first load
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
        return null // Return null on retry indicates failure
      }

      if (!data) {
        if (!isRetry) {
          console.error(`${logPrefix} ❌ Report: No data returned`)
          alert('Report not found or you do not have permission to view it')
          router.push('/dashboard')
        }
        return null // Return null on retry
      }

      // Log success only on first load
      if (!isRetry) {
        console.log(`${logPrefix} ✅ Report: Report fetched successfully`, data)
      }
      
      setReport(data)
      return data // Return fetched report data

    } catch (error) {
      if (!isRetry) {
        console.error(`${logPrefix} ❌ Report: Exception while fetching report:`, error)
        console.error(`${logPrefix} ❌ Report: Exception details:`, JSON.stringify(error, Object.getOwnPropertyNames(error)))
        alert('Error loading report, returning to dashboard. Error: ' + (error instanceof Error ? error.message : String(error)))
        router.push('/dashboard')
      }
      return null // Return null on retry
    } finally {
      // Ensure full screen loading is stopped only in the main non-retry flow
      if (!isRetry) {
        setLoading(false)
      }
    }
  }, [searchParams, user?.id, supabase, router, pageLoadId])

  // Start streaming (depends on fetchReport, defined after it)
  const startStreaming = useCallback(async (reportId: string) => {
    try {
      setIsStreaming(true)
      
      // Get birthData from sessionStorage
      const birthDataStr = sessionStorage.getItem(`birthData_${reportId}`)
      if (!birthDataStr) {
        console.error('❌ [Report] No birthData found in sessionStorage')
        return
      }
      
      const birthData = JSON.parse(birthDataStr)
      
      // Initiate streaming request
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
          // Clean up sessionStorage
          sessionStorage.removeItem(`birthData_${reportId}`)
          // Re-fetch report data
          await fetchReport(true)
          break
        }

        buffer += decoder.decode(value, { stream: true })
        
        // Process SSE messages
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep the last incomplete line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'chunk') {
                setStreamingContent(prev => {
                  const newContent = prev + data.content
                  return newContent
                })
                
                // Periodically refresh report data (get latest content from database)
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
                alert('Streaming error: ' + data.error)
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
      alert('Streaming failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
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
        
        // Check if streaming needs to be started
        const shouldStream = searchParams.get('stream') === 'true'
        const reportId = searchParams.get('id')
        
        if (shouldStream && reportId && !fetchedReport.full_report) {
          console.log(`${logPrefix} 📡 Report: Starting streaming...`)
          startStreaming(reportId).catch(err => {
            console.error(`${logPrefix} ❌ Report: Failed to start streaming:`, err)
          })
        }
        
        // Check if redirected from successful payment page (via URL parameter)
        const fromPayment = searchParams.get('from') === 'payment'
        
        console.log(`${logPrefix} Initial fetch completed.`, {
            isPaid: fetchedReport?.is_paid,
            fromPayment: fromPayment
        });
        
        // Start payment verification polling only when redirected from payment page and report is unpaid
        if (fetchedReport && !fetchedReport.is_paid && fromPayment) {
          console.log(`${logPrefix} ✅ Report: Conditions met. Starting payment verification polling...`)
          setIsVerifying(true)
          
          let attempts = 0
          const maxAttempts = 15 // Increased to 15 times (45 seconds)
          const initialDelay = 1000 // First check delayed by 1 second
          const intervalTime = 3000 // Subsequent checks every 3 seconds

          const pollingLogic = async () => {
            attempts++
            console.log(`${logPrefix} 🔄 Report: Polling attempt #${attempts}`)
            
            const updatedReport = await fetchReport(true) // true indicates retry
            
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
          // First quick check
          setTimeout(() => {
            pollingLogic();
            // Then set up periodic checks
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

  // (Defined above)

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

  // Parse report content, convert Markdown to displayable content
  const parseReportContent = (content: string) => {
    if (!content) return ''
    
    return content
      // Handle titles
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mb-6 border-b border-purple-500/30 pb-2">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-purple-300 mb-4 mt-8">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-purple-200 mb-3 mt-6">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold text-purple-100 mb-2 mt-4">$1</h4>')
      
      // Handle lists
      .replace(/^\- (.*$)/gim, '<li class="flex items-start gap-2 text-gray-300 mb-2"><div class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div><span>$1</span></li>')
      .replace(/^\* (.*$)/gim, '<li class="flex items-start gap-2 text-gray-300 mb-2"><div class="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div><span>$1</span></li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="flex items-start gap-2 text-gray-300 mb-2"><span class="text-purple-400 font-semibold mr-2">$1</span></li>')
      
      // Handle text formatting
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-200 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-purple-100 italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-purple-900/50 text-purple-200 px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // Handle links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-purple-300 hover:text-purple-200 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Handle horizontal rules
      .replace(/^---$/gim, '<hr class="border-purple-500/30 my-6">')
      .replace(/^___$/gim, '<hr class="border-purple-500/30 my-6">')
      
      // Handle blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-purple-500/50 pl-4 py-2 bg-purple-900/20 text-gray-300 italic">$1</blockquote>')
      
      // Handle paragraphs
      .replace(/\n\n/g, '</p><p class="text-gray-200 leading-relaxed mb-4">')
      .replace(/^(?!<[h|l|b|c|a|q])/gm, '<p class="text-gray-200 leading-relaxed mb-4">')
      .replace(/<p class="text-gray-200 leading-relaxed mb-4"><\/p>/g, '')
      
      // Clean up extra empty paragraphs
      .replace(/<p class="text-gray-200 leading-relaxed mb-4"><\/p>/g, '')
      .replace(/<p class="text-gray-200 leading-relaxed mb-4">\s*<\/p>/g, '')
  }

  // Get report content
  const getReportContent = () => {
    if (!report) return ''

    // If verifying payment, insert a notice
    if (isVerifying) {
      return `# Verifying Payment Status...
      
## Please Wait
We are confirming your payment information. This usually takes a few seconds. The page will refresh automatically.`
    }

    // If there is streaming content, use it first
    if (streamingContent) {
      return streamingContent + (isStreaming ? '\n\n*Generating...*' : '')
    }

    // If there is a full report, show full report
    if (report.full_report) {
      return report.full_report
    }

    // If there is a preview report and not paid, show preview
    if (report.preview_report) {
      return report.preview_report
    }

    // If no report content, show a concise placeholder
    return `# Your astrological report is on its way...`
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

// Main page component, wrapped with Suspense
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
