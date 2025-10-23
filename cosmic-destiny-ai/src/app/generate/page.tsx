'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useSupabase } from '@/contexts/SupabaseContext'
import { Button } from '@/components/ui/button'
import { Sparkles, Calendar, Clock, Globe, User, AlertCircle, CheckCircle } from 'lucide-react'

// 强制动态渲染
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
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate calculation time
      
      // Here should call real Bazi calculation service
      const baziData = {
        heavenlyStems: ['甲', '乙', '丙', '丁'],
        earthlyBranches: ['子', '丑', '寅', '卯'],
        dayMaster: '甲',
        elements: { wood: 2, fire: 1, earth: 1, metal: 1, water: 1 }
      }

      await updateStepStatus(1, 'completed')

      // Step 3: Generate report content
      await updateStepStatus(2, 'processing')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate AI generation time
      
      const mockPreviewReport = generatePreviewReport(birthData, baziData)
      const mockFullReport = generateFullReport(birthData, baziData)

      await updateStepStatus(2, 'completed')

      // Step 4: Save report data
      await updateStepStatus(3, 'processing')
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate save time
      
      const reportInsertData = {
        user_id: user.id,
        name: birthData.reportName || `命理报告 - ${new Date(birthData.birthDate).toLocaleDateString()}`,
        birth_date: birthData.birthDate,
        birth_time: birthData.birthTime || null,
        timezone: birthData.timeZone,
        gender: birthData.gender,
        is_time_known_input: birthData.isTimeKnownInput,
        is_paid: false,
        bazi_data: baziData,
        full_report: mockFullReport,
        preview_report: mockPreviewReport
      }

      const { data: reportData, error: reportError } = await supabase
        .from('user_reports')
        .insert(reportInsertData as any)
        .select()
        .single()

      if (reportError) {
        throw new Error(`Failed to save report: ${reportError.message}`)
      }

      setReportId((reportData as any).id)
      await updateStepStatus(3, 'completed')

      // Delay before redirect to let user see completion status
      setTimeout(() => {
        router.push(`/report?id=${(reportData as any).id}`)
      }, 1000)

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
    return `# 您的命理概览

## 出生信息
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '未知'}
- 性别：${birthData.gender === 'male' ? '男' : '女'}
- 时区：${birthData.timeZone}

## 核心性格特征
基于您的八字分析，您的日主为${baziData.dayMaster}，这赋予了您独特的个性魅力。您是一个充满智慧和创造力的人，善于观察和思考，总能在细节中发现别人忽视的价值。您的内心深处有着对完美的追求，这使您在做事时格外认真细致。同时，您具有很强的直觉力和同理心，能够敏锐地感知他人的情绪变化。

## 天赋潜能
您最突出的天赋在于创新思维和沟通能力。您天生具有将复杂概念简单化的能力，善于用独特的视角解决问题。在艺术创作、策略规划或人际交往方面，您都展现出超乎常人的天赋。特别是在需要创意和灵感的领域，您总能迸发出令人惊喜的想法。

## 事业方向
根据您的五行配置，最适合您的职业方向是创意产业和知识服务业。设计、媒体、教育、咨询等需要创造力和沟通能力的行业都很适合您。您也适合担任团队的智囊角色，为组织提供战略性建议。创业也是不错的选择，特别是在文化创意或科技创新领域。

## 感情运势
在感情方面，您追求心灵层面的共鸣。您需要一个能够理解您内心世界、与您进行深度交流的伴侣。您的感情表达方式含蓄而深情，更喜欢用行动而非言语来表达爱意。建议您在选择伴侣时，重视精神契合度，寻找能够共同成长的人生伴侣。

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
  }

  const generateFullReport = (birthData: BirthData, baziData: any): string => {
    return generatePreviewReport(birthData, baziData) + `

## 完整版内容（付费解锁）

### 详细职业规划
根据您的五行配置，最适合您的职业方向是创意产业和知识服务业。设计、媒体、教育、咨询等需要创造力和沟通能力的行业都很适合您。您也适合担任团队的智囊角色，为组织提供战略性建议。创业也是不错的选择，特别是在文化创意或科技创新领域。

### 感情运势分析
在感情方面，您追求心灵层面的共鸣。您需要一个能够理解您内心世界、与您进行深度交流的伴侣。您的感情表达方式含蓄而深情，更喜欢用行动而非言语来表达爱意。建议您在选择伴侣时，重视精神契合度，寻找能够共同成长的人生伴侣。

### 健康养生建议
您的体质偏向于需要平衡的调理。建议多进行户外活动，保持心情愉悦，避免过度思虑。在饮食方面，多食用新鲜蔬果，少食辛辣刺激食物。定期进行冥想或瑜伽练习，有助于平衡身心。`
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
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
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
