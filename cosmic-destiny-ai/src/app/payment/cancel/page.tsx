'use client'

import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          {/* Cancel Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
              
              <p className="text-gray-300 mb-8">
                Your payment was cancelled. No charges have been made to your account.
              </p>

              <div className="bg-white/5 rounded-lg p-6 mb-8 border border-white/10">
                <h2 className="text-lg font-semibold mb-3">Why unlock the full report?</h2>
                <ul className="text-left text-gray-300 space-y-2">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">✨</span>
                    <span>Deep dive into your personality traits and characteristics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">💼</span>
                    <span>Detailed career guidance and opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">❤️</span>
                    <span>Relationship compatibility insights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">🎯</span>
                    <span>Life path recommendations and timing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">💪</span>
                    <span>Strengths, challenges, and growth opportunities</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-8 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                >
                  Back to Dashboard
                </button>

                <button
                  onClick={() => router.push('/generate')}
                  className="w-full bg-white/10 text-white font-semibold py-4 px-8 rounded-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  Generate New Report
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>
              Questions? Contact us at contact@starwhisperai.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

