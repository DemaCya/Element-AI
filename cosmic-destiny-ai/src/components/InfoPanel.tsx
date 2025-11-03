'use client'

import React, { useEffect, useState } from 'react'
import { X, Star, Sparkles, Moon, Sun } from 'lucide-react'

interface InfoPanelProps {
  activePanel: 'about' | 'philosophy' | null
  onClose: () => void
}

export default function InfoPanel({ activePanel, onClose }: InfoPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentPanel, setCurrentPanel] = useState<'about' | 'philosophy' | null>(null)

  useEffect(() => {
    if (activePanel) {
      setCurrentPanel(activePanel)
      // Small delay to ensure the panel is in the DOM before starting animation
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
      // Wait for animation to complete before clearing current panel
      setTimeout(() => setCurrentPanel(null), 300)
    }
  }, [activePanel])

  if (!currentPanel) return null

  const aboutContent = {
    title: 'About Star Whisper AI',
    sections: [
      {
        icon: Star,
        title: 'Our Calling',
        content: 'To unlock the cosmic secrets encoded in the stars at the moment of your birth, guiding you toward a life of profound purpose and clarity.'
      },
      {
        icon: Sparkles,
        title: 'The Oracle',
        content: "Our digital oracle is a fusion of ancient astrological charts and sophisticated AI. It doesn't just calculate; it interprets, revealing the narrative of your life's potential as written in the stars."
      },
      {
        icon: Moon,
        title: 'Your Cosmic Map',
        content: "We provide you with a personalized cosmic map. Navigate your life's journey with insights into your personality, career, relationships, and destiny. Discover your strengths, understand your challenges, and unlock your true potential."
      }
    ]
  }

  const philosophyContent = {
    title: 'Our Philosophy',
    sections: [
      {
        icon: Sun,
        title: 'Ancient Wisdom, Modern Language',
        content: 'We speak the ancient language of the stars, translated for the modern soul. We honor the sacred traditions of astrology while using AI to make its wisdom clearer and more accessible than ever before.'
      },
      {
        icon: Star,
        title: 'You Are the Hero of Your Story',
        content: "Your birth chart is a map, not a script. We believe the stars illuminate the path, but you hold the power to walk it. Our insights are designed to empower you to be the conscious author of your own destiny."
      },
      {
        icon: Sparkles,
        title: 'A Universe of Wisdom',
        content: 'We unite the celestial wisdom of the East with the inquisitive spirit of the West. Star Whisper AI is a global sanctuary for self-discovery, open to all who seek to understand their place in the universe.'
      },
      {
        icon: Moon,
        title: 'Guiding Principles',
        content: 'Our guidance is offered with reverence and responsibility. We aim to inspire wonder and self-awareness, fostering a positive and empowering relationship with your own life\'s journey.'
      }
    ]
  }

  const content = currentPanel === 'about' ? aboutContent : philosophyContent

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-slate-900/95 backdrop-blur-sm z-50 shadow-2xl transform transition-transform duration-300 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <h2 className="text-2xl font-bold text-glow bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">{content.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-300 hover:text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {content.sections.map((section, index) => {
              const Icon = section.icon
              return (
                <div key={index} className="group">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <Icon className="w-6 h-6 text-purple-200" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-100 transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-white leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                  {index < content.sections.length - 1 && (
                    <div className="mt-6 border-b border-purple-500/10" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-purple-500/20 bg-purple-500/5">
            <p className="text-sm text-gray-300 text-center">
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent font-semibold">Star Whisper AI</span> • Where Ancient Wisdom Meets Modern Technology
            </p>
          </div>
        </div>
      </div>
    </>
  )
}