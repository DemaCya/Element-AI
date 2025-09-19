'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { createClient } from '@/lib/supabase/client'
import { PaymentService } from '@/services/paymentService'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/Navigation'
import {
  FileText,
  Download,
  CreditCard,
  Calendar,
  Globe,
  User,
  Sparkles,
  ChevronDown,
  Lock,
  Unlock,
  Loader2
} from 'lucide-react'
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

interface ReportData {
  id: string
  birth_date: string
  birth_time?: string
  timezone: string
  gender: string
  bazi_data: any
  preview_report: any[]
  full_report: any[]
  is_paid: boolean
  created_at: string
}

interface ReportSection {
  title: string
  content: string
  preview?: boolean
}

export default function ReportPage({ params }: { params: { reportId: string } }) {
  const { user } = useUser()
  const router = useRouter()
  const supabase = createClient()

  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showPayment, setShowPayment] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    fetchReport()
  }, [user, router, params.reportId])

  const fetchReport = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('id', params.reportId)
        .eq('user_id', user!.id)
        .single()

      if (error) throw error
      setReport(data)
    } catch (error) {
      console.error('Error fetching report:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(title)) {
      newExpanded.delete(title)
    } else {
      newExpanded.add(title)
    }
    setExpandedSections(newExpanded)
  }

  const downloadPDF = async () => {
    if (!report) return

    // Simple PDF download using browser's print functionality
    window.print()
  }

  const handlePayment = async () => {
    if (!user || !report) return

    setProcessingPayment(true)
    try {
      // Create payment session
      const result = await PaymentService.createPaymentSession(report.id, user.id)

      if (result.success && result.checkoutUrl) {
        // In a real implementation, redirect to Creem checkout
        // For now, simulate payment
        const paymentResult = await PaymentService.createPayment({
          reportId: report.id,
          amount: 19.99,
          currency: 'USD',
          userId: user.id,
          userEmail: user.email || ''
        })

        if (paymentResult.success) {
          // Refresh the page to show the full report
          window.location.reload()
        } else {
          alert('Payment failed: ' + paymentResult.error)
        }
      } else {
        alert('Failed to create payment session: ' + result.error)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment processing failed. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  const getVisibleSections = (): ReportSection[] => {
    if (!report) return []

    const sections = report.is_paid ? report.full_report : report.preview_report
    return sections || []
  }

  const getHiddenSectionsCount = (): number => {
    if (!report || report.is_paid) return 0
    return (report.full_report?.length || 0) - (report.preview_report?.length || 0)
  }

  if (loading) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading your cosmic report...</div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Report not found</div>
      </div>
    )
  }

  const visibleSections = getVisibleSections()
  const hiddenSectionsCount = getHiddenSectionsCount()

  return (
    <div className="cosmic-bg min-h-screen">
      <Navigation user={user} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Report Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 mb-8 border border-purple-500/20">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-glow mb-4">Your Cosmic Destiny Report</h1>
              <p className="text-gray-300 mb-6">
                A personalized analysis based on your birth chart and cosmic energies
              </p>

              {/* Birth Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(report.birth_date)}</span>
                </div>
                {report.birth_time && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Sparkles className="w-4 h-4" />
                    <span>{report.birth_time}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <Globe className="w-4 h-4" />
                  <span>{report.timezone}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {!report.is_paid && (
                <Button
                  variant="cosmic"
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className="whitespace-nowrap"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Unlock Full Report - $19.99
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={downloadPDF}
                className="whitespace-nowrap"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-center gap-2 text-sm">
            {report.is_paid ? (
              <>
                <Unlock className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Premium Report Unlocked</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400">Preview Report ({visibleSections.length} of {report.full_report?.length} sections)</span>
              </>
            )}
          </div>
        </div>

        {/* Report Sections */}
        <div className="space-y-6">
          {visibleSections.map((section, index) => (
            <div
              key={section.title}
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-purple-500/20 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-purple-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-purple-400 font-semibold">{index + 1}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                  {!section.preview && !report.is_paid && (
                    <Lock className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedSections.has(section.title) ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {(expandedSections.has(section.title) || section.preview || report.is_paid) && (
                <div className="px-6 pb-6">
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gray-300 whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Locked Sections Notice */}
          {!report.is_paid && hiddenSectionsCount > 0 && (
            <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg p-8 border border-purple-500/30 text-center">
              <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Unlock {hiddenSectionsCount} More Insights
              </h3>
              <p className="text-gray-300 mb-6">
                Get access to your complete destiny analysis including detailed career guidance,
                relationship compatibility, life path predictions, and personalized health recommendations.
              </p>
              <Button
                variant="cosmic"
                size="lg"
                onClick={handlePayment}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Unlock Full Report for $19.99
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Bazi Chart Summary */}
        {report.bazi_data && (
          <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4">Your Bazi Chart Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-400 mb-1">Day Master</div>
                <div className="text-white font-semibold">{report.bazi_data.dayMaster}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Year Pillar</div>
                <div className="text-white font-semibold">{report.bazi_data.yearPillar}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Month Pillar</div>
                <div className="text-white font-semibold">{report.bazi_data.monthPillar}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Day Pillar</div>
                <div className="text-white font-semibold">{report.bazi_data.dayPillar}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Generated on {formatDate(report.created_at)} • Report ID: {report.id}</p>
          <p className="mt-2">This report is for entertainment purposes only.</p>
        </div>
      </div>

      {/* Payment Modal (Placeholder) */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900/95 backdrop-blur-md rounded-lg p-8 max-w-md w-full mx-4 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-glow mb-4">Payment Coming Soon</h3>
            <p className="text-gray-300 mb-6">
              We're currently integrating Creem payment system. You'll be able to unlock your full report very soon!
            </p>
            <Button
              variant="outline"
              onClick={() => setShowPayment(false)}
              className="w-full"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}