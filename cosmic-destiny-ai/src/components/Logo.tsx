'use client'

import React from 'react'
import { Star, Sparkles } from 'lucide-react'

interface LogoProps {
  className?: string
  showText?: boolean
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div className="relative w-10 h-10">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-0.5">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
            <Star className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        {/* Sparkle effect */}
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <span className="text-xl font-bold text-glow">
          Cosmic Destiny AI
        </span>
      )}
    </div>
  )
}