'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Menu, X, User, LogIn, FileText, History, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import InfoPanel from './InfoPanel'
import Logo from './Logo'
import AuthModal from './auth/AuthModal'
import { useUser } from '@/contexts/UserContext'

interface NavigationProps {
  user?: {
    id: string
    email: string
    profile?: {
      fullName?: string
    }
  } | null
}

export default function Navigation({ user }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<'about' | 'philosophy' | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const router = useRouter()
  const { signOut } = useUser()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="cosmic-outline"
                    size="sm"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>{user.profile?.fullName || user.email}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </Button>

                  {/* User Dropdown */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-sm rounded-lg border border-purple-500/30 shadow-2xl overflow-hidden">
                      <div className="p-2">
                        <Link
                          href="/dashboard"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>

                        <button
                          onClick={() => {
                            setShowUserDropdown(false)
                            // Navigate to dashboard and open birth form
                            router.push('/dashboard')
                            setTimeout(() => {
                              const event = new CustomEvent('openBirthForm')
                              window.dispatchEvent(event)
                            }, 100)
                          }}
                          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors w-full text-left"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Switch Account</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserDropdown(false)
                            router.push('/dashboard')
                          }}
                          className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors w-full text-left"
                        >
                          <History className="w-4 h-4" />
                          <span>View History</span>
                        </button>

                        <div className="border-t border-purple-500/20 my-2"></div>

                        <button
                          onClick={() => {
                            setShowUserDropdown(false)
                            setShowLogoutModal(true)
                          }}
                          className="flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
                  <>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="cosmic-outline" className="w-full">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      className="w-full border-red-400 text-red-400 hover:bg-red-400/10 mt-2"
                      onClick={() => {
                        setShowLogoutModal(true)
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800/95 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Confirm Logout</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to logout of your account?</p>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutModal(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  variant="cosmic"
                  onClick={async () => {
                    setShowLogoutModal(false)
                    setIsMenuOpen(false)
                    await signOut()
                    window.location.reload()
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
          // Force refresh to update navigation with user info
          window.location.reload()
        }}
      />
    </>
  )
}