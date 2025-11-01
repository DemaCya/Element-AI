'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useSupabase } from '@/contexts/SupabaseContext'
import { Button } from '@/components/ui/button'
import { Sparkles, Calendar, Clock, Globe, User, AlertCircle, CheckCircle } from 'lucide-react'
// No longer need to import BaziService here
// import { BaziService } from '@/services/baziService'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface BirthData {
  birthDate: string
  birthTime: string
  timeZone: string
  gender: 'male' | 'female'
  isTimeKnownInput: boolean
  reportName?: string
}

interface GenerationStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  icon: React.ReactNode
}

// 使用useSearchParams的组件
function GenerateReportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useUser()
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [reportId, setReportId] = useState<string | null>(null)
  const [aiProgress, setAiProgress] = useState(0) // AI生成进度 (0-100)
  const supabase = useSupabase()

  // Generation steps configuration
  const generationSteps: GenerationStep[] = [
    {
      id: 'validate',
      title: 'Validating User Information',
      description: 'Checking user login status and input data',
      status: 'pending',
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'calculate',
      title: 'Calculating Bazi Destiny',
      description: 'Computing heavenly stems and earthly branches based on birth information',
      status: 'pending',
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      id: 'generate',
      title: 'Generating Report Content',
      description: 'Using AI to generate personalized destiny report',
      status: 'pending',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 'save',
      title: 'Saving Report Data',
      description: 'Storing the report in the database',
      status: 'pending',
      icon: <CheckCircle className="w-5 h-5" />
    }
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      // Check for required parameters
      const birthDate = searchParams.get('birthDate')
      const timeZone = searchParams.get('timeZone')
      const gender = searchParams.get('gender')

      if (!birthDate || !timeZone || !gender) {
        setError('Missing required birth information, please fill out the form again')
        return
      }

      // Start generating report
      generateReport()
    }
  }, [user?.id, authLoading, router, searchParams])

  const generateReport = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Step 1: Validate user information
      await updateStepStatus(0, 'processing')
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate processing time
      
      if (!user) {
        throw new Error('User not logged in')
      }

      const birthData: BirthData = {
        birthDate: searchParams.get('birthDate')!,
        birthTime: searchParams.get('birthTime') || '',
        timeZone: searchParams.get('timeZone')!,
        gender: searchParams.get('gender') as 'male' | 'female',
        isTimeKnownInput: searchParams.get('isTimeKnownInput') === 'true',
        reportName: searchParams.get('reportName') || ''
      }

      await updateStepStatus(0, 'completed')

      // Step 2: Calculate Bazi destiny
      await updateStepStatus(1, 'processing')
      
      // Call the new API route to perform Bazi calculation on the server
      const response = await fetch('/api/calculate-bazi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(birthData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to calculate Bazi from API')
      }

      const baziData = await response.json()
      console.log('Bazi calculation completed via API:', baziData)

      await updateStepStatus(1, 'completed')

      // Step 3: Create report record first (without content, will be populated by streaming)
      await updateStepStatus(2, 'processing')
      
      // Print Bazi calculation results for verification
      console.log('🔮 [Generate] Bazi Calculation Results:')
      console.log('📊 [Generate] Heavenly Stems:', baziData.heavenlyStems)
      console.log('📊 [Generate] Earthly Branches:', baziData.earthlyBranches)
      console.log('👑 [Generate] Day Master:', baziData.dayMaster)
      console.log('⚖️ [Generate] Elements:', baziData.elements)
      
      // Create empty report record first
      const reportInsertData = {
        user_id: user.id,
        name: birthData.reportName || `Destiny Profile for ${birthData.birthDate}`,
        birth_date: birthData.birthDate,
        birth_time: birthData.birthTime || null,
        timezone: birthData.timeZone,
        gender: birthData.gender,
        is_time_known_input: birthData.isTimeKnownInput,
        is_paid: false,
        bazi_data: baziData,
        full_report: '', // Will be populated by streaming
        preview_report: '' // Will be populated by streaming
      }

      const { data: reportData, error: reportError } = await supabase
        .from('user_reports')
        .insert(reportInsertData as any)
        .select()
        .single()

      if (reportError) {
        throw new Error(`Failed to create report: ${reportError.message}`)
      }

      const newReportId = (reportData as any).id
      setReportId(newReportId)
      
      // Store birthData in sessionStorage for streaming API
      sessionStorage.setItem(`birthData_${newReportId}`, JSON.stringify(birthData))
      
      await updateStepStatus(2, 'completed')

      // Step 4: Mark as ready for streaming
      await updateStepStatus(3, 'completed')

      // To avoid the report page displaying placeholder content before streaming begins,
      // we pause here for a moment, keeping the user on the four-step progress screen
      // until the backend starts generating, then redirect.
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push(`/report?id=${newReportId}&stream=true`)

    } catch (error) {
      console.error('Failed to generate report:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred while generating report')
      setIsGenerating(false)
    }
  }

  const updateStepStatus = async (stepIndex: number, status: GenerationStep['status']) => {
    setCurrentStep(stepIndex)
    // Here can add more complex step status management
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const generatePreviewReport = (birthData: BirthData, baziData: any): string => {
    return `# Your Numerology Overview

## Birth Information
- Birth Date: ${birthData.birthDate}
- Birth Time: ${birthData.birthTime || 'Unknown'}
- Gender: ${birthData.gender === 'male' ? 'Male' : 'Female'}
- Time Zone: ${birthData.timeZone}

## Bazi Information
- Heavenly Stems: ${baziData.heavenlyStems.join(', ')}
- Earthly Branches: ${baziData.earthlyBranches.join(', ')}
- Day Master: ${baziData.dayMaster}
- Five Elements Distribution: Wood ${baziData.elements.wood}, Fire ${baziData.elements.fire}, Earth ${baziData.elements.earth}, Metal ${baziData.elements.metal}, Water ${baziData.elements.water}

## Core Personality Traits
Based on your Bazi analysis, your Day Master is ${baziData.dayMaster}, which gives you a unique personality charm. You are a person full of wisdom and creativity, good at observation and thinking, and always able to find value in details that others ignore. Deep in your heart, you have a pursuit of perfection, which makes you particularly serious and meticulous in your work. At the same time, you have strong intuition and empathy, and can keenly perceive the emotional changes of others.

## Talents and Potential
Your most outstanding talents lie in innovative thinking and communication skills. You are born with the ability to simplify complex concepts and are good at solving problems from a unique perspective. You show extraordinary talent in artistic creation, strategic planning, or interpersonal communication. Especially in fields that require creativity and inspiration, you can always come up with surprising ideas.

## Career Path
According to your Five Elements configuration, the most suitable career paths for you are the creative industry and knowledge service industry. Industries such as design, media, education, and consulting that require creativity and communication skills are very suitable for you. You are also suitable for the role of a team think tank, providing strategic advice to the organization. Entrepreneurship is also a good choice, especially in the fields of cultural creativity or technological innovation.

## Relationship Fortune
In terms of relationships, you pursue spiritual resonance. You need a partner who can understand your inner world and have deep communication with you. Your way of expressing feelings is subtle and deep, and you prefer to express love with actions rather than words. It is recommended that you pay attention to spiritual compatibility when choosing a partner and look for a life partner who can grow with you.

---

**Want to learn more?**

The full report includes:
- In-depth personality analysis and growth suggestions
- Detailed career planning and wealth strategies
- Comprehensive relationship analysis and best matches
- Life mission and key turning points
- Personalized health and wellness plan
- And more exclusive numerology guidance for you...

Unlock the full report now and start your journey of destiny exploration!`
  }

  const generateFullReport = (birthData: BirthData, baziData: any): string => {
    return generatePreviewReport(birthData, baziData) + `

## Full Version Content (Paid Unlock)

### Detailed Career Planning
According to your Five Elements configuration, the most suitable career paths for you are the creative industry and knowledge service industry. Industries such as design, media, education, and consulting that require creativity and communication skills are very suitable for you. You are also suitable for the role of a team think tank, providing strategic advice to the organization. Entrepreneurship is also a good choice, especially in the fields of cultural creativity or technological innovation.

### Relationship Fortune Analysis
In terms of relationships, you pursue spiritual resonance. You need a partner who can understand your inner world and have deep communication with you. Your way of expressing feelings is subtle and deep, and you prefer to express love with actions rather than words. It is recommended that you pay attention to spiritual compatibility when choosing a partner and look for a life partner who can grow with you.

### Health and Wellness Advice
Your constitution tends to need balanced conditioning. It is recommended to engage in more outdoor activities, maintain a happy mood, and avoid overthinking. In terms of diet, eat more fresh fruits and vegetables and less spicy and irritating food. Regular meditation or yoga practice will help balance your body and mind.`
  }

  if (authLoading) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Verifying user identity...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth
  }

  return (
    <div className="cosmic-bg min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-glow bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Generating Your Destiny Report
              </h1>
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-xl text-gray-300">
              Creating your personalized cosmic destiny analysis report
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-red-200 font-semibold mb-2">Error occurred while generating report</h3>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-400/10"
                >
                  Back to Home
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Generation Steps */}
          {!error && (
            <div className="space-y-6">
              {generationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border transition-all duration-500 ${
                    index === currentStep
                      ? 'border-purple-500/50 shadow-lg shadow-purple-500/20'
                      : index < currentStep
                      ? 'border-green-500/30'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        index === currentStep
                          ? 'bg-purple-500 text-white animate-pulse'
                          : index < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {step.title}
                      </h3>
                      <p className="text-gray-400">{step.description}</p>
                    </div>
                    {index === currentStep && (
                      index === 2 && aiProgress > 0 ? (
                        // 显示进度环
                        <div className="relative w-6 h-6">
                          <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                            {/* 背景圆环 */}
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="rgba(168, 85, 247, 0.2)"
                              strokeWidth="2"
                              fill="none"
                            />
                            {/* 进度圆环 */}
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="#a855f7"
                              strokeWidth="2"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 10}`}
                              strokeDashoffset={`${2 * Math.PI * 10 * (1 - aiProgress / 100)}`}
                              strokeLinecap="round"
                              className="transition-all duration-300"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-purple-400">
                            {Math.round(aiProgress)}%
                          </span>
                        </div>
                      ) : (
                        // 默认旋转加载器
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Success State */}
          {reportId && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mt-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-green-200 font-semibold mb-2">Report generated successfully!</h3>
                  <p className="text-green-300">Redirecting to your personalized report page...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 主页面组件，用Suspense包装
export default function GenerateReport() {
  return (
    <Suspense fallback={
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Preparing to generate report...</p>
        </div>
      </div>
    }>
      <GenerateReportContent />
    </Suspense>
  )
}
