'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { createClient } from '@/lib/supabase/client'
import { BirthData, BaziData } from '@/types'
import { BaziService } from '@/services/baziService'
import { ReportService } from '@/services/reportService'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Calendar, Globe } from 'lucide-react'

interface Report {
  id: string
  birth_date: string
  birth_time?: string
  timezone: string
  gender: string
  is_paid: boolean
}

export default function GenerateReportPage({ params }: { params: { reportId: string } }) {
  const { user } = useUser()
  const router = useRouter()
  const supabase = createClient()

  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

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

      if (data.full_report) {
        // Report already generated, redirect to view page
        router.push(`/report/${params.reportId}`)
        return
      }

      setReport(data)
    } catch (error) {
      console.error('Error fetching report:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    if (!report) return

    setGenerating(true)
    setProgress(0)

    try {
      // Step 1: Calculate Bazi
      setProgress(20)
      const birthData: BirthData = {
        birthDate: report.birth_date,
        birthTime: report.birth_time,
        timeZone: report.timezone,
        gender: report.gender as any
      }

      const baziData = await BaziService.calculateBazi(birthData)

      // Step 2: Generate report sections
      setProgress(50)
      const sections = await ReportService.generateReport(birthData, baziData)

      // Step 3: Create preview and full reports
      setProgress(80)
      const previewSections = sections.filter(s => s.preview).slice(0, 2) // Only first 2 sections for preview

      // Step 4: Save to database
      setProgress(90)
      const { error } = await supabase
        .from('user_reports')
        .update({
          bazi_data: baziData,
          preview_report: previewSections,
          full_report: sections,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.reportId)

      if (error) throw error

      setProgress(100)

      // Redirect to report page
      setTimeout(() => {
        router.push(`/report/${params.reportId}`)
      }, 1000)

    } catch (error: any) {
      console.error('Error generating report:', error)
      alert(`Failed to generate report: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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

  if (generating) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-glow mb-4">
              Generating Your Cosmic Report
            </h2>
            <p className="text-gray-300">
              Our AI is analyzing your birth chart and cosmic energies...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Steps */}
          <div className="text-sm text-gray-400 space-y-2">
            <div className={`flex items-center gap-2 ${progress >= 20 ? 'text-purple-400' : ''}`}>
              <div className={`w-2 h-2 rounded-full ${progress >= 20 ? 'bg-purple-400' : 'bg-gray-600'}`} />
              Calculating your Bazi chart
            </div>
            <div className={`flex items-center gap-2 ${progress >= 50 ? 'text-purple-400' : ''}`}>
              <div className={`w-2 h-2 rounded-full ${progress >= 50 ? 'bg-purple-400' : 'bg-gray-600'}`} />
              Analyzing cosmic patterns
            </div>
            <div className={`flex items-center gap-2 ${progress >= 80 ? 'text-purple-400' : ''}`}>
              <div className={`w-2 h-2 rounded-full ${progress >= 80 ? 'bg-purple-400' : 'bg-gray-600'}`} />
              Generating personalized insights
            </div>
            <div className={`flex items-center gap-2 ${progress >= 100 ? 'text-purple-400' : ''}`}>
              <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-purple-400' : 'bg-gray-600'}`} />
              Finalizing your destiny report
            </div>
          </div>

          {/* Birth Info */}
          <div className="mt-8 p-4 bg-slate-800/50 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-400 mb-2">Birth Information</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {new Date(report.birth_date).toLocaleDateString()}
              </div>
              {report.birth_time && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3" />
                  {report.birth_time}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3" />
                {report.timezone}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cosmic-bg min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold text-glow mb-4">
            Ready to Discover Your Destiny?
          </h2>
          <p className="text-gray-300 mb-6">
            Based on your birth information, we'll generate a comprehensive cosmic destiny report
            with personalized insights into your personality, career, relationships, and life path.
          </p>

          {/* Birth Info Summary */}
          <div className="p-4 bg-slate-800/50 rounded-lg mb-6">
            <h3 className="text-sm font-semibold text-purple-400 mb-2">Birth Information</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {new Date(report.birth_date).toLocaleDateString()}
              </div>
              {report.birth_time && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3" />
                  {report.birth_time}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3" />
                {report.timezone}
              </div>
            </div>
          </div>

          <Button
            variant="cosmic"
            size="lg"
            onClick={generateReport}
            className="w-full"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate My Cosmic Report
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            This process combines traditional Chinese astrology (Bazi) with AI analysis
          </p>
        </div>
      </div>
    </div>
  )
}