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
    title: 'About Cosmic Destiny AI',
    sections: [
      {
        icon: Star,
        title: 'Our Mission',
        content: 'Cosmic Destiny AI was born from the intersection of ancient wisdom and modern technology. We believe that the cosmic patterns that guided our ancestors still hold valuable insights for our lives today.'
      },
      {
        icon: Sparkles,
        title: 'The Technology',
        content: 'Using advanced AI algorithms and traditional Chinese astrology calculations, we analyze your birth chart to provide personalized insights. Our system combines the precision of modern computing with the depth of ancient metaphysical traditions.'
      },
      {
        icon: Moon,
        title: 'What We Offer',
        content: 'From personality analysis to career guidance, relationship compatibility to life path predictions, we offer comprehensive insights based on your unique cosmic fingerprint—your birth chart.'
      }
    ]
  }

  const philosophyContent = {
    title: 'Our Philosophy',
    sections: [
      {
        icon: Sun,
        title: 'Harmony of Tradition and Innovation',
        content: 'We honor the timeless wisdom of Chinese astrology while embracing cutting-edge AI technology. This fusion allows us to present ancient knowledge in accessible, modern formats.'
      },
      {
        icon: Star,
        title: 'Personal Empowerment',
        content: 'Our readings are not deterministic prophecies but tools for self-discovery. We believe understanding your cosmic patterns empowers you to make more informed choices and live more consciously.'
      },
      {
        icon: Sparkles,
        title: 'Bridging Worlds',
        content: 'Cosmic Destiny AI serves as a bridge between Eastern and Western approaches to self-understanding, making profound astrological insights available to everyone, regardless of cultural background.'
      },
      {
        icon: Moon,
        title: 'Ethical Approach',
        content: 'We are committed to providing thoughtful, responsible guidance. Our AI analyses are designed to inspire growth and self-reflection, never to create dependency or fear.'
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
            <h2 className="text-2xl font-bold text-glow">{content.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-white" />
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
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
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
            <p className="text-sm text-gray-400 text-center">
              Cosmic Destiny AI • Where Ancient Wisdom Meets Modern Technology
            </p>
          </div>
        </div>
      </div>
    </>
  )
}