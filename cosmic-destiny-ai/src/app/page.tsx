'use client'

import React, { useState } from 'react'
import StarSystem from '@/components/StarSystem'
import Navigation from '@/components/Navigation'
import BirthForm from '@/components/BirthForm'
import FAQAccordion from '@/components/FAQAccordion'
import AuthModal from '@/components/auth/AuthModal'
import { Button } from '@/components/ui/button'
import { ChevronDown, Sparkles } from 'lucide-react'
import { BirthData } from '@/types'
import { useUser } from '@/contexts/UserContext'

export default function Home() {
  const [showForm, setShowForm] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useUser()

  const faqItems = [
    {
      question: "How does this work?",
      answer: "We combine traditional Chinese astrology (Bazi) with advanced AI analysis. Simply provide your birth details, and our system will generate a comprehensive personality and destiny report based on ancient wisdom and modern insights."
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

  const handleBirthFormSubmit = async (data: BirthData) => {
    setShowForm(false)
    
    try {
      // Call API to generate report
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate: data.birthDate,
          birthTime: data.birthTime,
          timeZone: data.timeZone,
          gender: data.gender
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate report')
      }

      // Redirect to report page
      window.location.href = `/report/${result.reportId}`
    } catch (error) {
      console.error('Error generating report:', error)
      alert('生成报告失败，请稍后重试')
    }
  }

  const scrollToContent = () => {
    document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="cosmic-bg smooth-scroll">
      <Navigation user={user} />

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

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-slate-800/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold text-center mb-12 text-glow bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              What Our Users Say
            </h2>

            <div className="space-y-8">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                <blockquote className="text-white text-lg italic leading-relaxed">
                  "The personality analysis was scarily accurate. It gave me a new language to
                  understand myself and my relationships with others."
                </blockquote>
                <cite className="text-purple-200 mt-4 block text-lg">- Alex P.</cite>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                <blockquote className="text-white text-lg italic leading-relaxed">
                  "I was skeptical at first, but the career advice was genuinely insightful.
                  Highly recommended for anyone at a crossroads in their professional life."
                </blockquote>
                <cite className="text-purple-200 mt-4 block text-lg">- Sarah J.</cite>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-purple-500/20">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <a href="#" className="text-white hover:text-purple-200 transition-colors">
                Contact
              </a>
              <a href="#" className="text-white hover:text-purple-200 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-white hover:text-purple-200 transition-colors">
                Privacy Policy
              </a>
            </div>
            <p className="text-gray-300">
              © 2024 <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent font-semibold">Cosmic Destiny AI</span>. For entertainment purposes only.
            </p>
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
            // Force page refresh to update navigation with user info
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
