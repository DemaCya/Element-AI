'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/Logo'
import { Suspense } from 'react'

/**
 * Main content of the success page.
 * This component uses useSearchParams, so it must be wrapped in Suspense.
 */
function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportId = searchParams.get('report_id')

  const handleViewReport = () => {
    if (reportId) {
      router.push(`/report?id=${reportId}&from=payment`)
    } else {
      // Fallback if report_id is not in the URL
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          {/* Success Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">Payment Successful! 🎉</h1>
              
              <p className="text-gray-300 mb-8">
                Thank you for your payment. Your full destiny report is being unlocked now.
              </p>

              <div className="bg-white/5 rounded-lg p-6 mb-8 border border-white/10">
                <p className="text-sm text-gray-300">
                  Your report will be available in a few moments. 
                  Please check your dashboard to view the complete analysis.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleViewReport}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-8 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                >
                  View Full Report
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-white/10 text-white font-semibold py-4 px-8 rounded-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>

          {/* Help Info */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>
              Questions? Contact us at support@starwhisper.ai
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Payment Success Page - Simplified MVP Version
 * 
 * This page wraps the main content in a Suspense boundary to allow
 * the use of `useSearchParams` without causing build errors.
 */
export default function PaymentSuccessPage() {
  // A simple fallback UI. You can style this to match your app's theme.
  const fallback = <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>

  return (
    <Suspense fallback={fallback}>
      <SuccessContent />
    </Suspense>
  )
}
