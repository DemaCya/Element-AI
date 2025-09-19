export interface TimeZoneOption {
  value: string
  label: string
  offset: string
}

export const timeZones: TimeZoneOption[] = [
  // Major time zones
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)', offset: 'UTC±0' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', offset: 'UTC-8' },

  // Asian time zones
  { value: 'Asia/Shanghai', label: 'China Standard Time', offset: 'UTC+8' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong Time', offset: 'UTC+8' },
  { value: 'Asia/Taipei', label: 'Taipei Time', offset: 'UTC+8' },
  { value: 'Asia/Singapore', label: 'Singapore Time', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time', offset: 'UTC+9' },
  { value: 'Asia/Seoul', label: 'Korea Standard Time', offset: 'UTC+9' },
  { value: 'Asia/Bangkok', label: 'Indochina Time', offset: 'UTC+7' },
  { value: 'Asia/Kolkata', label: 'India Standard Time', offset: 'UTC+5:30' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time', offset: 'UTC+4' },

  // European time zones
  { value: 'Europe/London', label: 'Greenwich Mean Time', offset: 'UTC±0' },
  { value: 'Europe/Paris', label: 'Central European Time', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Central European Time', offset: 'UTC+1' },
  { value: 'Europe/Moscow', label: 'Moscow Standard Time', offset: 'UTC+3' },
  { value: 'Europe/Zurich', label: 'Central European Time', offset: 'UTC+1' },

  // Australia and Pacific
  { value: 'Australia/Sydney', label: 'Australian Eastern Time', offset: 'UTC+10' },
  { value: 'Australia/Melbourne', label: 'Australian Eastern Time', offset: 'UTC+10' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time', offset: 'UTC+12' },

  // Other major time zones
  { value: 'America/Toronto', label: 'Eastern Time (Canada)', offset: 'UTC-5' },
  { value: 'America/Vancouver', label: 'Pacific Time (Canada)', offset: 'UTC-8' },
  { value: 'America/Mexico_City', label: 'Central Time (Mexico)', offset: 'UTC-6' },
  { value: 'America/Sao_Paulo', label: 'Brasilia Time', offset: 'UTC-3' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina Time', offset: 'UTC-3' },

  // Middle East and Africa
  { value: 'Africa/Cairo', label: 'Eastern European Time', offset: 'UTC+2' },
  { value: 'Africa/Johannesburg', label: 'South Africa Time', offset: 'UTC+2' },
  { value: 'Asia/Jerusalem', label: 'Israel Standard Time', offset: 'UTC+2' },
  { value: 'Asia/Riyadh', label: 'Arabian Standard Time', offset: 'UTC+3' },

  // South and Southeast Asia
  { value: 'Asia/Kuala_Lumpur', label: 'Malaysia Time', offset: 'UTC+8' },
  { value: 'Asia/Jakarta', label: 'Western Indonesia Time', offset: 'UTC+7' },
  { value: 'Asia/Manila', label: 'Philippines Time', offset: 'UTC+8' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Indochina Time', offset: 'UTC+7' },

  // Additional time zones
  { value: 'Pacific/Honolulu', label: 'Hawaii-Aleutian Time', offset: 'UTC-10' },
  { value: 'America/Anchorage', label: 'Alaska Time', offset: 'UTC-9' },
  { value: 'America/Phoenix', label: 'Mountain Standard Time', offset: 'UTC-7' },
  { value: 'America/Regina', label: 'Central Standard Time', offset: 'UTC-6' },
  { value: 'America/St_Johns', label: 'Newfoundland Time', offset: 'UTC-3:30' },
]

export const popularTimeZones = timeZones.filter(tz =>
  ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney'].includes(tz.value)
)