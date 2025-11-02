'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import StarSystem from '@/components/StarSystem'
import Navigation from '@/components/Navigation'
import BirthForm from '@/components/BirthForm'
import FAQAccordion from '@/components/FAQAccordion'
import AuthModal from '@/components/auth/AuthModal'
import PolicyModal from '@/components/PolicyModal'
import { Button } from '@/components/ui/button'
import { ChevronDown, Sparkles } from 'lucide-react'
import { BirthData } from '@/types'
import { useUser } from '@/contexts/UserContext'

export default function Home() {
  const [showForm, setShowForm] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const { user, profile } = useUser()
  const router = useRouter()

  const faqItems = [
    {
      question: "How does this work?",
      answer: "We combine traditional Chinese astrology (Bazi) with advanced AI analysis. Simply provide your birth details, and our system will generate a comprehensive personality and destiny report based on ancient wisdom and modern insights."
    },
    {
      question: "What's the difference between giving my birth date to a generic AI and using your service?",
      answer: "After extensive testing, we've found that general-purpose AIs often \"hallucinate\" or make errors when calculating Bazi charts directly from a birth date. This can result in a completely wrong chart, leading to a misleading destiny report. Our service ensures accuracy by first using a professional Bazi plotting engine to generate your correct chart. The AI then provides analysis based on this accurate foundation."
    },
    {
      question: "Is this based on real astrology or science?",
      answer: "Our system uses authentic Bazi calculations combined with AI-powered analysis. While not scientifically proven, millions have found value in these ancient wisdom traditions for self-discovery and personal growth."
    },
    {
      question: "How is my data protected?",
      answer: "We take your privacy seriously. All data is encrypted and stored securely. You can delete your data at any time, and we never share your personal information with third parties without your consent."
    },
    {
      question: "What's included in the full report?",
      answer: "The complete report includes detailed personality analysis, career guidance, relationship insights, life path predictions, and health considerations. Each report is personalized based on your unique birth data."
    }
  ]

  const handleChartMyCosmos = () => {
    // Check if user is logged in
    if (user) {
      // If logged in, show the birth form
      setShowForm(true)
    } else {
      // If not logged in, show auth modal first
      setShowAuthModal(true)
    }
  }

  const handleBirthFormSubmit = async (data: BirthData & { reportName?: string }) => {
    setShowForm(false)
    
    // 重定向到专门的报告生成页面
    // 将数据通过URL参数传递
    const params = new URLSearchParams({
      birthDate: data.birthDate,
      birthTime: data.birthTime || '',
      timeZone: data.timeZone,
      gender: data.gender,
      isTimeKnownInput: data.isTimeKnownInput.toString(),
      reportName: data.reportName || ''
    })
    
    router.push(`/generate?${params.toString()}`)
  }

  const scrollToContent = () => {
    document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="cosmic-bg smooth-scroll">
      <Navigation user={user} profile={profile} />

      {/* Hero Section with Star System */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <StarSystem className="w-full h-full" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 mt-128">
          <p className="text-xl md:text-2xl mb-8 text-gray-300 animate-fade-up">
            Discover Your Destiny Through the Wisdom of the Stars
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="cosmic"
              size="lg"
              onClick={handleChartMyCosmos}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center">
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                <span className="font-semibold">Chart My Cosmos</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollToContent}
            className="text-white hover:text-purple-400"
          >
            <ChevronDown className="w-8 h-8" />
          </Button>
        </div>
      </section>

      {/* Content Section */}
      <div id="content" className="relative z-20 bg-slate-900">
        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold text-center mb-12 text-glow bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>

            <FAQAccordion items={faqItems} />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4 bg-slate-800/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold text-center mb-8 text-glow bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            
            <div className="bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-purple-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-2xl max-w-xl mx-auto">
              <div className="text-center">
                <div className="mb-4">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                    $4.49
                  </span>
                  <span className="text-gray-300 text-lg ml-2">USD</span>
                </div>
                <p className="text-gray-300 text-base mb-3">
                  Complete Cosmic Destiny Report
                </p>
                <p className="text-gray-400 text-sm mb-5">
                  Get your full personalized Bazi analysis report with detailed insights on personality, career, relationships, and life path.
                </p>
                <ul className="text-left text-gray-300 space-y-2 mb-6 max-w-sm mx-auto text-sm">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Free preview available (15% of content)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>One-time payment, lifetime access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>3000+ words of personalized content</span>
                  </li>
                </ul>
                <Button
                  variant="cosmic"
                  size="lg"
                  onClick={handleChartMyCosmos}
                  className="w-full sm:w-auto px-6"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-purple-500/20">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-gray-300 text-center">
                © 2025 <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent font-semibold">StarWhisperAI</span>. For entertainment purposes only.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-sm text-gray-400 hover:text-purple-300 transition-colors duration-200 underline underline-offset-4 hover:underline-offset-2"
                >
                  Privacy Policy
                </button>
                <span className="text-gray-500">|</span>
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="text-sm text-gray-400 hover:text-purple-300 transition-colors duration-200 underline underline-offset-4 hover:underline-offset-2"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Birth Form Modal */}
      {showForm && (
        <BirthForm
          onSubmit={handleBirthFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false)
          }}
        />
      )}

      {/* Privacy Policy Modal */}
      <PolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        type="privacy"
      />

      {/* Terms of Service Modal */}
      <PolicyModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type="terms"
      />
    </div>
  )
}
