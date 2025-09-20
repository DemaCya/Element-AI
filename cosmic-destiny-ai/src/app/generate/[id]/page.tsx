'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Sparkles, Star, Moon, Sun, Zap, CheckCircle } from 'lucide-react'

interface ReportData {
  birth_date: string
  birth_time?: string
  timezone: string
  gender: string
}

export default function GenerateReport({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const supabase = createClient()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: Star, text: 'Analyzing birth chart...', duration: 1000 },
    { icon: Moon, text: 'Calculating cosmic alignments...', duration: 1500 },
    { icon: Sun, text: 'Generating personality insights...', duration: 2000 },
    { icon: Zap, text: 'Creating life path analysis...', duration: 1500 },
    { icon: CheckCircle, text: 'Finalizing your cosmic report...', duration: 1000 }
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }

    fetchReportData()
  }, [user, authLoading, router, params.id])

  const fetchReportData = async () => {
    try {
      // For testing, try to get data from localStorage first
      const birthDataStr = localStorage.getItem('birthData')
      if (birthDataStr) {
        const birthData = JSON.parse(birthDataStr)
        setReportData({
          birth_date: birthData.birthDate,
          birth_time: birthData.birthTime || undefined,
          timezone: birthData.timeZone,
          gender: birthData.gender
        })
        setLoading(false)
        return
      }

      // Fallback to database query
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      if (data.user_id !== user?.id) {
        router.push('/dashboard')
        return
      }

      setReportData({
        birth_date: data.birth_date,
        birth_time: data.birth_time || undefined,
        timezone: data.timezone,
        gender: data.gender
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
      // For testing purposes, use mock data if database fails
      const mockBirthData = {
        birth_date: '1990-01-01',
        birth_time: '12:00',
        timezone: 'UTC',
        gender: 'other'
      }
      setReportData(mockBirthData)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setGenerating(true)
    setProgress(0)
    setCurrentStep(0)

    // Simulate report generation process
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      await new Promise(resolve => setTimeout(resolve, steps[i].duration))
      setProgress(((i + 1) / steps.length) * 100)
    }

    // Redirect to the report view
    setTimeout(() => {
      router.push(`/report/${params.id}`)
    }, 1000)
  }

  if (authLoading || loading) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !reportData) {
    return null // Will redirect
  }

  if (generating) {
    const CurrentIcon = steps[currentStep].icon

    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 text-center">
            {/* Progress Icon */}
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CurrentIcon className="w-10 h-10 text-purple-400 animate-pulse" />
            </div>

            {/* Progress Text */}
            <h3 className="text-xl font-semibold text-white mb-2">
              {steps[currentStep].text}
            </h3>
            <p className="text-gray-400 mb-6">
              Unlocking the secrets of your cosmic destiny...
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2 mb-6">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Percentage */}
            <p className="text-purple-300 font-medium">
              {Math.round(progress)}% Complete
            </p>

            {/* Cosmic Animation */}
            <div className="mt-8 flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 bg-purple-400 rounded-full animate-pulse`}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    opacity: i <= Math.floor((progress / 100) * 5) ? 1 : 0.3
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cosmic-bg min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-glow mb-4">
              Generate Your Cosmic Report
            </h1>
            <p className="text-xl text-gray-300">
              Ready to discover what the stars reveal about your destiny?
            </p>
          </div>

          {/* Birth Data Summary */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Birth Information</h2>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>
                <span className="text-purple-400">Birth Date:</span>
                <p>{new Date(reportData.birth_date).toLocaleDateString()}</p>
              </div>
              {reportData.birth_time && (
                <div>
                  <span className="text-purple-400">Birth Time:</span>
                  <p>{reportData.birth_time}</p>
                </div>
              )}
              <div>
                <span className="text-purple-400">Time Zone:</span>
                <p>{reportData.timezone}</p>
              </div>
              <div>
                <span className="text-purple-400">Gender:</span>
                <p className="capitalize">{reportData.gender}</p>
              </div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">What Your Report Will Include</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Personality analysis and character traits</span>
              </div>
              <div className="flex items-center gap-3">
                <Moon className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Career guidance and professional insights</span>
              </div>
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Relationship compatibility and patterns</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Life path predictions and timing</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="text-center">
            <Button
              variant="cosmic"
              size="lg"
              onClick={generateReport}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center">
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                Generate My Cosmic Report
              </div>
            </Button>
            <p className="text-gray-400 text-sm mt-4">
              This will take approximately 1-2 minutes to complete
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}