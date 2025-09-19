'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Globe, User, Clock, X, Sparkles, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BirthData } from '@/types'
import { timeZones, popularTimeZones } from '@/data/timezones'

interface BirthFormProps {
  onSubmit: (data: BirthData) => void
  onClose?: () => void
  isLoading?: boolean
}

export default function BirthForm({ onSubmit, onClose, isLoading }: BirthFormProps) {
  const [formData, setFormData] = useState<BirthData>({
    birthDate: '',
    birthTime: '',
    timeZone: 'UTC',
    gender: 'other'
  })
  const [showAllTimeZones, setShowAllTimeZones] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.birthDate && formData.timeZone) {
      onSubmit(formData)
    }
  }

  const updateFormData = (field: keyof BirthData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  return (
    <>
      {/* Backdrop with fade animation */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      >
        {/* Modal container with scale and slide animation */}
        <div
          className={`relative max-w-md w-full mx-4 transform transition-all duration-300 ease-out ${
            isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Main modal with glass morphism and modern design */}
          <div className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden">

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />

            {/* Floating particles */}
            <div className="absolute top-4 right-4 opacity-20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="absolute top-8 right-8 opacity-15">
              <Star className="w-4 h-4 animate-pulse delay-100" />
            </div>
            <div className="absolute bottom-8 left-8 opacity-10">
              <Zap className="w-5 h-5 animate-pulse delay-200" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                  Chart Your Cosmic Destiny
                </h2>
                <p className="text-gray-400 text-sm">
                  Enter your birth details to unlock the secrets of the universe
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Birth Date */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Birth Date
                  </label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => updateFormData('birthDate', e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder-gray-500"
                    required
                  />
                </div>

                {/* Birth Time */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Birth Time (Optional)
                  </label>
                  <Input
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => updateFormData('birthTime', e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder-gray-500"
                  />
                </div>

                {/* Time Zone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Globe className="w-4 h-4 text-purple-400" />
                    Time Zone
                  </label>
                  <div className="relative">
                    <select
                      value={formData.timeZone}
                      onChange={(e) => updateFormData('timeZone', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white rounded-lg appearance-none cursor-pointer transition-all duration-200"
                      required
                    >
                      <option value="" className="bg-slate-900">Select time zone</option>
                      {popularTimeZones.map((tz) => (
                        <option key={`popular-${tz.value}`} value={tz.value} className="bg-slate-900">
                          {tz.label}
                        </option>
                      ))}
                      <option disabled className="bg-slate-900 text-gray-500">─────────────</option>
                      {timeZones.map((tz) => (
                        <option key={`all-${tz.value}`} value={tz.value} className="bg-slate-900">
                          {tz.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Globe className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <User className="w-4 h-4 text-purple-400" />
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateFormData('gender', option.value)}
                        className={`py-3 px-4 rounded-lg border transition-all duration-200 text-sm font-medium ${
                          formData.gender === option.value
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-lg'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="cosmic"
                  size="lg"
                  disabled={isLoading || !formData.birthDate || !formData.timeZone}
                  className="w-full group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                        Generate My Cosmic Report
                      </>
                    )}
                  </div>
                </Button>
              </form>

              {/* Footer note */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  ✨ Your cosmic journey begins with a single click
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}