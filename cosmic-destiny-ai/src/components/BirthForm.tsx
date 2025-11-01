'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Globe, User, X, Sparkles, Star, Zap, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BirthData } from '@/types'
import { timeZones, popularTimeZones } from '@/data/timezones'

interface BirthFormProps {
  onSubmit: (data: BirthData) => void
  onClose?: () => void
  isLoading?: boolean
}

interface ModernDatePickerProps {
  value: string
  onChange: (date: string) => void
  label: string
}

interface ModernTimePickerProps {
  value: string
  onChange: (time: string) => void
  label: string
}

const ModernDatePicker: React.FC<ModernDatePickerProps> = ({ value, onChange, label }) => {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [showYearSelector, setShowYearSelector] = useState(false)
  const [showMonthSelector, setShowMonthSelector] = useState(false)

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December']

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handleDateSelect = (day: number) => {
    const selectedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onChange(selectedDate)
    setShowCalendar(false)
    setShowYearSelector(false)
    setShowMonthSelector(false)
  }

  const handleYearSelect = (year: number) => {
    setCurrentYear(year)
    setShowYearSelector(false)
  }

  const handleMonthSelect = (month: number) => {
    setCurrentMonth(month)
    setShowMonthSelector(false)
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = value === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString()

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`p-2 rounded-lg transition-all duration-200 text-sm font-medium ${
            isSelected
              ? 'bg-purple-500 text-white shadow-lg transform scale-105'
              : isToday
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return label
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Generate years for selection (100 years range)
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i)

  return (
    <div className="relative z-[1000]">
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white rounded-lg transition-all duration-200 text-left group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span className={value ? 'text-white' : 'text-gray-500'}>
              {formatDisplayDate(value)}
            </span>
          </div>
          <div className="text-gray-400 group-hover:text-white transition-colors">
            {showCalendar ? '✕' : '📅'}
          </div>
        </div>
      </button>

      {showCalendar && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-purple-500/30 shadow-2xl z-[9999] p-4 w-96 max-h-[500px] overflow-y-auto">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11)
                  setCurrentYear(currentYear - 1)
                } else {
                  setCurrentMonth(currentMonth - 1)
                }
                setShowYearSelector(false)
                setShowMonthSelector(false)
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ‹
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMonthSelector(!showMonthSelector)
                  setShowYearSelector(false)
                }}
                className={`text-white font-medium hover:text-purple-300 transition-colors px-3 py-1 rounded-lg ${
                  showMonthSelector ? 'bg-purple-500/20' : 'hover:bg-white/10'
                }`}
              >
                {months[currentMonth]}
              </button>
              <span className="text-white">-</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowYearSelector(!showYearSelector)
                  setShowMonthSelector(false)
                }}
                className={`text-white font-medium hover:text-purple-300 transition-colors px-3 py-1 rounded-lg ${
                  showYearSelector ? 'bg-purple-500/20' : 'hover:bg-white/10'
                }`}
              >
                {currentYear}
              </button>
            </div>
            <button
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0)
                  setCurrentYear(currentYear + 1)
                } else {
                  setCurrentMonth(currentMonth + 1)
                }
                setShowYearSelector(false)
                setShowMonthSelector(false)
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ›
            </button>
          </div>

          {/* Year Selector - Full Calendar Style */}
          {showYearSelector && (
            <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl animate-fade-in">
              <div className="text-center mb-3">
                <h3 className="text-sm font-semibold text-white mb-1">Select Year</h3>
                <p className="text-xs text-gray-400">Choose your birth year</p>
              </div>
              <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleYearSelect(year)
                    }}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      year === currentYear
                        ? 'bg-purple-500 text-white shadow-lg transform scale-105'
                        : 'bg-white/5 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-105'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Month Selector - Full Calendar Style */}
          {showMonthSelector && (
            <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl animate-fade-in">
              <div className="text-center mb-3">
                <h3 className="text-sm font-semibold text-white mb-1">Select Month</h3>
                <p className="text-xs text-gray-400">Choose your birth month</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {months.map((month, index) => (
                  <button
                    key={month}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMonthSelect(index)
                    }}
                    className={`p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                      index === currentMonth
                        ? 'bg-purple-500 text-white shadow-lg transform scale-105'
                        : 'bg-white/5 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-105'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-1">
                      {month.substring(0, 3)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Week Days - Only show when no selector is active */}
          {!showYearSelector && !showMonthSelector && (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs text-gray-500 font-medium">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </>
          )}

          {/* Quick Navigation */}
          <div className="flex justify-between mt-4 pt-4 border-t border-purple-500/20">
            <button
              onClick={() => {
                const today = new Date()
                setCurrentYear(today.getFullYear())
                setCurrentMonth(today.getMonth())
                setShowYearSelector(false)
                setShowMonthSelector(false)
              }}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                setShowCalendar(false)
                setShowYearSelector(false)
                setShowMonthSelector(false)
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const ModernTimePicker: React.FC<ModernTimePickerProps> = ({ value, onChange, label }) => {
  const [showTimePicker, setShowTimePicker] = useState(false)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 15, 30, 45]

  const handleTimeSelect = (hour: number, minute: number) => {
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    onChange(time)
    setShowTimePicker(false)
  }

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return label
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowTimePicker(!showTimePicker)}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white rounded-lg transition-all duration-200 text-left group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-400" />
            <span className={value ? 'text-white' : 'text-gray-500'}>
              {formatDisplayTime(value)}
            </span>
          </div>
          <div className="text-gray-400 group-hover:text-white transition-colors">
            {showTimePicker ? '✕' : '🕐'}
          </div>
        </div>
      </button>

      {showTimePicker && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-purple-500/30 shadow-2xl z-[9999] p-4 w-96 max-h-64 overflow-y-auto">
          <div className="space-y-1">
            {hours.map(hour => (
              <div key={hour} className="flex gap-1">
                {minutes.map(minute => (
                  <button
                    key={`${hour}-${minute}`}
                    onClick={() => handleTimeSelect(hour, minute)}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                      value === `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {formatDisplayTime(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function BirthForm({ onSubmit, onClose, isLoading }: BirthFormProps) {
  const [formData, setFormData] = useState<BirthData & { reportName?: string }>({
    birthDate: '',
    birthTime: '',
    timeZone: '',
    gender: 'male',
    isTimeKnownInput: false,
    reportName: ''
  })
  const [showAllTimeZones, setShowAllTimeZones] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [step, setStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    console.log("🚀 handleSubmit function called!")
    e.preventDefault()
    console.log("Current step:", step)
    console.log("Form data:", formData)
    // Only submit if we're on step 2 and all required fields are filled
    if (step === 2 && formData.birthDate && formData.timeZone && formData.gender) {
      console.log("✅ Step two, ready to submit")
      console.log("Submitted formData:", formData)
      console.log("isTimeKnownInput:", formData.isTimeKnownInput)
      console.log("birthTime:", formData.birthTime)
      console.log("🚀 Preparing to call onSubmit")
      onSubmit(formData)
    } else {
      console.log("❌ Conditions not met, cannot submit")
      console.log("step === 2:", step === 2)
      console.log("formData.birthDate:", formData.birthDate)
      console.log("formData.timeZone:", formData.timeZone)
      console.log("formData.gender:", formData.gender)
    }
  }

  const updateFormData = (field: keyof (BirthData & { reportName?: string }), value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  const filteredTimeZones = timeZones.filter(tz =>
    tz.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tz.value.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const displayTimeZones = showAllTimeZones ? filteredTimeZones : popularTimeZones

  const nextStep = () => {
    console.log("nextStep called, current step:", step)
    if (step < 2) {
      console.log("Setting step to:", step + 1)
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
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
          className={`relative max-w-xl w-full mx-4 transform transition-all duration-300 ease-out max-h-screen ${
            isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Main modal with glass morphism and modern design */}
          <div className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden">

            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 animate-pulse" />
            <div className="absolute inset-2 bg-gradient-to-br from-slate-900/95 via-purple-900/10 to-slate-900/95 backdrop-blur-xl rounded-2xl" />

            {/* Decorative floating elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl animate-pulse delay-100" />
            <div className="absolute top-20 left-20 w-20 h-20 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-200" />

            {/* Floating particles */}
            <div className="absolute top-6 right-6 opacity-20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="absolute top-12 right-12 opacity-15">
              <Star className="w-4 h-4 animate-pulse delay-100" />
            </div>
            <div className="absolute bottom-12 left-12 opacity-10">
              <Zap className="w-5 h-5 animate-pulse delay-200" />
            </div>

            {/* Progress indicator */}
            <div className="relative z-10 pt-6 px-8">
              <div className="flex items-center justify-between mb-6">
                {[1, 2].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      step >= stepNum
                        ? 'bg-purple-500 text-white shadow-lg transform scale-110'
                        : 'bg-white/10 text-gray-500'
                    }`}>
                      {stepNum}
                    </div>
                    {stepNum < 2 && (
                      <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                        step > stepNum ? 'bg-purple-500' : 'bg-white/10'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 min-h-[70vh]">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-full mb-4 shadow-2xl">
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                  Chart Your Cosmic Destiny
                </h2>
                <p className="text-gray-400 text-sm">
                  Step {step} of 2: {step === 1 ? 'Birth Information & Gender' : 'Time Zone Selection'}
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
                {/* Step 1: Birth Information & Gender */}
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Report Name */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-400" />
                        Report Name
                      </h3>
                      <Input
                        type="text"
                        placeholder="e.g. My Destiny Profile, My Mom's Destiny Profile (optional)"
                        value={formData.reportName || ''}
                        onChange={(e) => updateFormData('reportName', e.target.value)}
                        className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-400/50 rounded-xl px-4 py-3"
                      />
                    </div>

                    {/* Birth Date */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        Birth Information
                      </h3>
                      <ModernDatePicker
                        value={formData.birthDate}
                        onChange={(date) => updateFormData('birthDate', date)}
                        label="Select your birth date"
                      />
                    </div>

                    {/* Birth Time */}
                    <div className="space-y-3">
                      <ModernTimePicker
                        value={formData.birthTime || ''}
                        onChange={(time) => {
                          console.log('Time changed:', time)
                          updateFormData('birthTime', time)
                          const isTimeKnown = time !== ''
                          console.log('Setting isTimeKnownInput to:', isTimeKnown)
                          updateFormData('isTimeKnownInput', isTimeKnown)
                        }}
                        label="Birth time (optional)"
                      />
                    </div>

                    {/* Gender Selection */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-400" />
                        Gender Identity
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'male', label: 'Male', emoji: '👨', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
                          { value: 'female', label: 'Female', emoji: '👩', color: 'from-pink-500/20 to-pink-600/20 border-pink-500/30' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateFormData('gender', option.value)}
                            className={`group relative overflow-hidden rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                              formData.gender === option.value
                                ? `bg-gradient-to-br ${option.color} border-current shadow-lg scale-105`
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="p-4 text-center">
                              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                                {option.emoji}
                              </div>
                              <div className={`text-sm font-medium transition-colors duration-200 ${
                                formData.gender === option.value
                                  ? 'text-white'
                                  : 'text-gray-400 group-hover:text-white'
                              }`}>
                                {option.label}
                              </div>
                            </div>
                            {formData.gender === option.value && (
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Why this information matters</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            Your birth date, time, and gender are essential for calculating your unique cosmic blueprint. 
                            The exact birth time helps determine your rising sign and creates a more accurate astrological profile.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Time Zone Selection */}
                {step === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                        <Globe className="w-6 h-6 text-purple-400" />
                        Select Your Time Zone
                      </h3>
                      <p className="text-gray-400">
                        This helps us calculate your cosmic profile accurately
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <MapPin className="w-5 h-5 text-purple-400" />
                        Search for your location
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Type your city or country..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 pl-4 pr-10"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Globe className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {displayTimeZones.map((tz) => (
                        <button
                          key={tz.value}
                          type="button"
                          onClick={() => {
                            updateFormData('timeZone', tz.value)
                            setSearchQuery('')
                          }}
                          className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                            formData.timeZone === tz.value
                              ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/50 text-purple-300 shadow-lg'
                              : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-transparent hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-base">{tz.label}</div>
                              <div className="text-sm text-gray-400 mt-1">{tz.value}</div>
                            </div>
                            {formData.timeZone === tz.value && (
                              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {!showAllTimeZones && (
                      <button
                        type="button"
                        onClick={() => setShowAllTimeZones(true)}
                        className="w-full py-3 text-purple-400 hover:text-purple-300 text-sm font-medium border border-purple-500/30 rounded-xl hover:bg-purple-500/10 transition-all duration-200"
                      >
                        Show all time zones
                      </button>
                    )}

                    {/* Confirmation Card */}
                    {formData.timeZone && (
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Time zone selected</h4>
                            <p className="text-gray-300 text-sm">
                              {displayTimeZones.find(tz => tz.value === formData.timeZone)?.label || formData.timeZone}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                  )}

                  {step < 2 ? (
                    <Button
                      type="button"
                      variant="cosmic"
                      onClick={nextStep}
                      disabled={
                        (step === 1 && (!formData.birthDate || !formData.gender))
                      }
                      className="flex-1 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center justify-center">
                        Next Step
                        <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform duration-200" />
                      </div>
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="cosmic"
                      disabled={(() => {
                        const disabled = isLoading || !formData.birthDate || !formData.timeZone || !formData.gender
                        console.log("🔍 Button disabled state check:", {
                          isLoading,
                          birthDate: formData.birthDate,
                          timeZone: formData.timeZone,
                          gender: formData.gender,
                          disabled
                        })
                        return disabled
                      })()}
                      onClick={(e) => {
                        console.log("🔥 Button clicked!")
                        e.preventDefault()
                        console.log("Step 2 button clicked")
                        console.log("formData:", formData)
                        console.log("isLoading:", isLoading)
                        console.log("disabled condition:", isLoading || !formData.birthDate || !formData.timeZone || !formData.gender)
                        console.log("🔥 Preparing to call handleSubmit")
                        handleSubmit(e)
                      }}
                      className="flex-1 group relative overflow-hidden"
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
                            Generate My Cosmic Report
                            <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform duration-200" />
                          </>
                        )}
                      </div>
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}