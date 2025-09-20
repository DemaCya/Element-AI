'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Star,
  Moon,
  Sun,
  Zap,
  Heart,
  Briefcase,
  Compass,
  Download,
  Share,
  Sparkles,
  Calendar,
  Clock,
  Globe,
  User
} from 'lucide-react'

interface CosmicReport {
  id: string
  birth_date: string
  birth_time?: string
  timezone: string
  gender: string
  is_paid: boolean
  created_at: string
  report_data?: {
    personality?: {
      overview: string
      strengths: string[]
      challenges: string[]
    }
    career?: {
      bestPaths: string[]
      timing: string
    }
    relationships?: {
      compatibility: string
      advice: string
    }
    lifePath?: {
      purpose: string
      challenges: string
    }
    health?: {
      considerations: string[]
      advice: string
    }
  }
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const supabase = createClient()
  const [report, setReport] = useState<CosmicReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }

    fetchReport()
  }, [user, authLoading, router, params.id])

  const fetchReport = async () => {
    try {
      // Check if it's a test report (starts with 'test-report-')
      if (params.id.startsWith('test-report-')) {
        // For test reports, get data from localStorage and create mock report
        const birthDataStr = localStorage.getItem('birthData')
        if (birthDataStr) {
          const birthData = JSON.parse(birthDataStr)
          const mockReport: CosmicReport = {
            id: params.id,
            birth_date: birthData.birthDate,
            birth_time: birthData.birthTime || undefined,
            timezone: birthData.timeZone,
            gender: birthData.gender,
            is_paid: false,
            created_at: new Date().toISOString(),
            report_data: {
              personality: {
                overview: "Based on your cosmic chart, you possess a unique blend of traits that make you naturally intuitive and creative. Your birth alignment suggests a strong connection to both earthly wisdom and celestial guidance.",
                strengths: [
                  "Natural leadership abilities",
                  "Strong intuitive sense",
                  "Creative problem-solving",
                  "Emotional intelligence",
                  "Adaptability"
                ],
                challenges: [
                  "Tendency to overthink",
                  "Perfectionist tendencies",
                  "Need for validation",
                  "Difficulty with routine",
                  "Sensitivity to criticism"
                ]
              },
              career: {
                bestPaths: [
                  "Creative industries (art, music, writing)",
                  "Leadership roles",
                  "Consulting and advisory",
                  "Technology and innovation",
                  "Healthcare and wellness"
                ],
                timing: "The next 6 months are particularly favorable for career changes. Consider making moves in late spring or early summer."
              },
              relationships: {
                compatibility: "You're most compatible with earth and water signs, who can provide the stability and emotional depth you seek.",
                advice: "Focus on open communication and don't be afraid to show vulnerability. Your authentic self is your greatest asset in relationships."
              },
              lifePath: {
                purpose: "Your life path involves being a bridge between different worlds - helping others connect with their higher purpose while staying grounded in reality.",
                challenges: "Learning to balance your idealistic nature with practical considerations will be key to your success."
              },
              health: {
                considerations: [
                  "Pay attention to stress levels",
                  "Regular exercise helps maintain balance",
                  "Meditation and mindfulness practices",
                  "Adequate sleep is crucial",
                  "Consider herbal remedies for anxiety"
                ],
                advice: "Your sensitive nature means you need extra care for your mental and emotional well-being. Regular self-care isn't optional - it's essential."
              }
            }
          }
          setReport(mockReport)
          setLoading(false)
          return
        }
      }

      // For real reports, query the database
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

      setReport(data)
    } catch (error) {
      console.error('Error fetching report:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
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
    return null // Will redirect
  }

  const mockReportData = {
    personality: {
      overview: "You possess a unique cosmic signature that blends creative fire with analytical earth. Your birth chart reveals a natural-born leader with exceptional communication abilities and a deep connection to both material success and spiritual growth.",
      strengths: [
        "Natural leadership and charisma",
        "Exceptional communication skills",
        "Strong intuition and emotional intelligence",
        "Ability to balance logic with creativity",
        "Adaptability in changing circumstances"
      ],
      challenges: [
        "Sometimes take on too much responsibility",
        "Can be overly perfectionist",
        "Tendency to prioritize others' needs over your own"
      ]
    },
    career: {
      bestPaths: [
        "Entrepreneurship and business leadership",
        "Creative industries (arts, media, design)",
        "Technology innovation and digital strategy",
        "Teaching, coaching, or mentoring roles",
        "Public speaking or communication-focused careers"
      ],
      timing: "The current cosmic alignment (2024-2025) is particularly favorable for career advancement. Jupiter's influence suggests expansion and new opportunities, while Saturn provides the discipline needed for long-term success."
    },
    relationships: {
      compatibility: "You are most compatible with individuals who have strong water and earth elements in their charts. Look for partners who are emotionally intelligent, grounded, and supportive of your ambitions.",
      advice: "Your relationships thrive when you maintain a balance between independence and connection. Practice vulnerability and allow yourself to receive support as readily as you give it."
    },
    lifePath: {
      purpose: "Your soul's journey involves bridging different worlds - whether that's connecting people, ideas, or communities. You are here to use your communication gifts to uplift others and create meaningful change.",
      challenges: "Your key life lessons involve learning to delegate, trusting others to share your burdens, and recognizing that asking for help is a sign of strength, not weakness."
    },
    health: {
      considerations: [
        "High energy levels need regular physical outlets",
        "Stress management is crucial for your sensitive system",
        "Benefit from both structured exercise and creative movement"
      ],
      advice: "Maintain balance between intense activity and rest. Your body responds well to routines that include both cardiovascular exercise and mindfulness practices."
    }
  }

  const reportData = report.report_data || mockReportData

  return (
    <div className="cosmic-bg min-h-screen">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="text-purple-300 hover:text-purple-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
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
                Your Cosmic Destiny Report
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
            {/* Personality Overview */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Personality Overview</h2>
              </div>
              <p className="text-gray-200 leading-relaxed mb-6">
                {reportData.personality?.overview || 'Personality analysis not available'}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Your Strengths</h3>
                  <ul className="space-y-2">
                    {reportData.personality.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Growth Opportunities</h3>
                  <ul className="space-y-2">
                    {reportData.personality.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Career Guidance */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Career Guidance</h2>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-purple-300 mb-3">Best Career Paths</h3>
                <div className="flex flex-wrap gap-2">
                  {reportData.career.bestPaths.map((path, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {path}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-purple-300 mb-3">Cosmic Timing</h3>
                <p className="text-gray-200 leading-relaxed">
                  {reportData.career.timing}
                </p>
              </div>
            </div>

            {/* Relationships */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Relationship Insights</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Compatibility</h3>
                  <p className="text-gray-200 leading-relaxed">
                    {reportData.relationships.compatibility}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Relationship Advice</h3>
                  <p className="text-gray-200 leading-relaxed">
                    {reportData.relationships.advice}
                  </p>
                </div>
              </div>
            </div>

            {/* Life Path */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Compass className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Life Purpose & Path</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Soul's Purpose</h3>
                  <p className="text-gray-200 leading-relaxed">
                    {reportData.lifePath.purpose}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Life Lessons</h3>
                  <p className="text-gray-200 leading-relaxed">
                    {reportData.lifePath.challenges}
                  </p>
                </div>
              </div>
            </div>

            {/* Health & Wellness */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Health & Wellness</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Considerations</h3>
                  <ul className="space-y-2">
                    {reportData.health.considerations.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Wellness Advice</h3>
                  <p className="text-gray-200 leading-relaxed">
                    {reportData.health.advice}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Footer */}
          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm mb-4">
              Generated on {new Date(report.created_at).toLocaleDateString()}
            </p>
            {!report.is_paid && (
              <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-2">Unlock Full Report</h3>
                <p className="text-gray-300 mb-4">
                  Get access to detailed predictions, monthly forecasts, and personalized recommendations
                </p>
                <Button variant="cosmic">
                  Upgrade to Premium - $19.99
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}