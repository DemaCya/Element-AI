'use client'

import React, { useState } from 'react'
import { Menu, X, User, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import InfoPanel from './InfoPanel'
import Logo from './Logo'
import AuthModal from './auth/AuthModal'

interface NavigationProps {
  user?: {
    id: string
    email: string
  } | null
}

export default function Navigation({ user }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<'about' | 'philosophy' | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActivePanel('about')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                About
              </button>
              <button
                onClick={() => setActivePanel('philosophy')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Philosophy
              </button>
              {user ? (
                <Link href="/dashboard">
                  <Button variant="cosmic-outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="cosmic"
                  size="sm"
                  className="group relative overflow-hidden"
                  onClick={() => setShowAuthModal(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center">
                    <LogIn className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform duration-200" />
                    <span className="font-semibold">Login</span>
                  </div>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden">
          <div className="fixed right-0 top-0 h-full w-64 bg-slate-900/95 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <Logo showText={false} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setActivePanel('about')
                    setIsMenuOpen(false)
                  }}
                  className="block text-gray-300 hover:text-white transition-colors py-2 w-full text-left"
                >
                  About
                </button>
                <button
                  onClick={() => {
                    setActivePanel('philosophy')
                    setIsMenuOpen(false)
                  }}
                  className="block text-gray-300 hover:text-white transition-colors py-2 w-full text-left"
                >
                  Philosophy
                </button>
                {user ? (
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="cosmic-outline" className="w-full">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="cosmic"
                    className="w-full group relative overflow-hidden"
                    onClick={() => {
                      setShowAuthModal(true)
                      setIsMenuOpen(false)
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center">
                      <LogIn className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform duration-200" />
                      <span className="font-semibold">Login</span>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <InfoPanel
        activePanel={activePanel}
        onClose={() => setActivePanel(null)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
          // You can add additional success handling here
        }}
      />
    </>
  )
}