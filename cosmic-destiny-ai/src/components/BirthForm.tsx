'use client'

import React, { useState } from 'react'
import { Calendar, Globe, User, Clock, X } from 'lucide-react'
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.birthDate && formData.timeZone) {
      onSubmit(formData)
    }
  }

  const updateFormData = (field: keyof BirthData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-lg p-8 max-w-md w-full mx-4 border border-purple-500/20 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-glow mb-6 text-center">
          Chart Your Cosmic Destiny
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Birth Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Birth Date
            </label>
            <Input
              type="date"
              value={formData.birthDate}
              onChange={(e) => updateFormData('birthDate', e.target.value)}
              className="bg-slate-800 border-purple-500/20 text-white"
              required
            />
          </div>

          {/* Birth Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Birth Time (Optional)
            </label>
            <Input
              type="time"
              value={formData.birthTime}
              onChange={(e) => updateFormData('birthTime', e.target.value)}
              className="bg-slate-800 border-purple-500/20 text-white"
            />
          </div>

          {/* Time Zone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Time Zone
            </label>
            <select
              value={formData.timeZone}
              onChange={(e) => updateFormData('timeZone', e.target.value)}
              className="w-full h-10 px-3 py-2 bg-slate-800 border border-purple-500/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select your time zone</option>
              <optgroup label="Popular Time Zones">
                {popularTimeZones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </optgroup>
              <optgroup label="All Time Zones">
                {timeZones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => updateFormData('gender', e.target.value as any)}
              className="w-full h-10 px-3 py-2 bg-slate-800 border border-purple-500/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="other">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="cosmic"
            className="w-full"
            disabled={isLoading || !formData.birthDate || !formData.timeZone}
          >
            {isLoading ? 'Generating Destiny...' : 'Generate My Destiny Report'}
          </Button>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center">
            This is for entertainment purposes only. Your cosmic journey awaits!
          </p>
        </form>
      </div>
    </div>
  )
}