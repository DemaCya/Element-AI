export interface BirthData {
  birthDate: string
  birthTime?: string
  timeZone: string
  gender: 'male' | 'female'
  isTimeKnownInput: boolean
}

export interface BaziData {
  // Basic Four Pillars Information
  heavenlyStems: string[]
  earthlyBranches: string[]
  hiddenStems: string[]
  yearPillar: string
  monthPillar: string
  dayPillar: string
  hourPillar?: string
  
  // Day Master Information
  dayMaster: string
  dayMasterNature: 'Yang' | 'Yin'
  dayMasterElement: 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER'
  
  // Five Elements Analysis
  elements: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  
  // Day Master Strength Analysis
  dayMasterStrength?: {
    strength: 'Strong' | 'Weak' | 'Balanced'
    score: number
    notes?: string[]
  }
  
  // Favorable Elements Analysis
  favorableElements?: {
    primary: string[]
    secondary?: string[]
    unfavorable?: string[]
    notes?: string[]
  }
  
  // Eight Mansions Analysis
  eightMansions?: {
    group: 'West' | 'East'
    lucky: {
      wealth: string
      health: string
      romance: string
      career: string
    }
    unlucky: {
      obstacles: string
      quarrels: string
      setbacks: string
      totalLoss: string
    }
  }
  
  // Basic Analysis
  lifeGua?: number
  nobleman?: string[]
  intelligence?: string
  skyHorse?: string
  peachBlossom?: string
  
  // Luck Pillar Information
  luckPillars?: {
    pillars: Array<{
      number: number
      heavenlyStem: string
      earthlyBranch: string
      yearStart: number | null
      yearEnd: number | null
      ageStart: number | null
    }>
    incrementRule: 1 | -1
    isTimingKnown: boolean
    currentPillar?: {
      number: number
      heavenlyStem: string
      earthlyBranch: string
      yearStart: number | null
      yearEnd: number | null
      ageStart: number | null
      currentAge: number
    }
  }
  
  // Interaction Analysis
  interactions?: Array<{
    type: string
    participants: Array<{
      pillar: string
      source: string
      elementChar: string
      elementType: string
    }>
    description?: string
    involvesFavorableElement?: boolean
    involvesUnfavorableElement?: boolean
  }>
}

export interface ReportSection {
  title: string
  content: string
  preview?: boolean
}

export interface DestinyReport {
  id: string
  userId: string
  birthData: BirthData
  baziData: BaziData
  sections: ReportSection[]
  createdAt: string
  isPaid: boolean
}

export interface PaymentData {
  amount: number
  currency: string
  reportId: string
  userId: string
}

export interface User {
  id: string
  email: string
  createdAt: string
  profile?: {
    fullName?: string
    avatarUrl?: string
  }
}