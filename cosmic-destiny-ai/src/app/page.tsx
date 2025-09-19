'use client'

import React, { useState } from 'react'
import StarSystem from '@/components/StarSystem'
import Navigation from '@/components/Navigation'
import BirthForm from '@/components/BirthForm'
import { Button } from '@/components/ui/button'
import { ChevronDown, Sparkles } from 'lucide-react'
import { BirthData } from '@/types'
import { useUser } from '@/contexts/UserContext'

export default function Home() {
  const [showForm, setShowForm] = useState(false)
  const { user } = useUser()

  const handleBirthFormSubmit = (data: BirthData) => {
    // This will be implemented with auth and report generation
    console.log('Birth data submitted:', data)
    setShowForm(false)
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
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-glow animate-fade-in">
            Cosmic Destiny AI
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 animate-fade-up">
            Discover Your Destiny Through the Wisdom of the Stars
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="cosmic"
              size="lg"
              onClick={() => setShowForm(true)}
              className="animate-float"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Chart My Cosmos
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
            <h2 className="text-4xl font-bold text-center mb-12 text-glow">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold mb-3 text-purple-400">
                  How does this work?
                </h3>
                <p className="text-gray-300">
                  We combine traditional Chinese astrology (Bazi) with advanced AI analysis.
                  Simply provide your birth details, and our system will generate a comprehensive
                  personality and destiny report based on ancient wisdom and modern insights.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold mb-3 text-purple-400">
                  Is this based on real astrology or science?
                </h3>
                <p className="text-gray-300">
                  Our system uses authentic Bazi calculations combined with AI-powered analysis.
                  While not scientifically proven, millions have found value in these ancient
                  wisdom traditions for self-discovery and personal growth.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold mb-3 text-purple-400">
                  How is my data protected?
                </h3>
                <p className="text-gray-300">
                  We take your privacy seriously. All data is encrypted and stored securely.
                  You can delete your data at any time, and we never share your personal
                  information with third parties without your consent.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold mb-3 text-purple-400">
                  What's included in the full report?
                </h3>
                <p className="text-gray-300">
                  The complete report includes detailed personality analysis, career guidance,
                  relationship insights, life path predictions, and health considerations.
                  Each report is personalized based on your unique birth data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-slate-800/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold text-center mb-12 text-glow">
              What Our Users Say
            </h2>

            <div className="space-y-8">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                <blockquote className="text-gray-300 text-lg italic">
                  "The personality analysis was scarily accurate. It gave me a new language to
                  understand myself and my relationships with others."
                </blockquote>
                <cite className="text-purple-400 mt-4 block">- Alex P.</cite>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                <blockquote className="text-gray-300 text-lg italic">
                  "I was skeptical at first, but the career advice was genuinely insightful.
                  Highly recommended for anyone at a crossroads in their professional life."
                </blockquote>
                <cite className="text-purple-400 mt-4 block">- Sarah J.</cite>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-purple-500/20">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                Contact
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                Privacy Policy
              </a>
            </div>
            <p className="text-gray-400">
              © 2024 Cosmic Destiny AI. For entertainment purposes only.
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
    </div>
  )
}
