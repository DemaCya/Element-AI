export interface BirthData {
  birthDate: string
  birthTime?: string
  timeZone: string
  gender: 'male' | 'female'
  isTimeKnownInput: boolean
}

export interface BaziData {
  // 基础四柱信息
  heavenlyStems: string[]
  earthlyBranches: string[]
  hiddenStems: string[]
  yearPillar: string
  monthPillar: string
  dayPillar: string
  hourPillar?: string
  
  // 日主信息
  dayMaster: string
  dayMasterNature: 'Yang' | 'Yin'
  dayMasterElement: 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER'
  
  // 五行分析
  elements: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  
  // 日主强弱分析
  dayMasterStrength?: {
    strength: 'Strong' | 'Weak' | 'Balanced'
    score: number
    notes?: string[]
  }
  
  // 有利元素分析
  favorableElements?: {
    primary: string[]
    secondary?: string[]
    unfavorable?: string[]
    notes?: string[]
  }
  
  // 八宅分析
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
  
  // 基本分析
  lifeGua?: number
  nobleman?: string[]
  intelligence?: string
  skyHorse?: string
  peachBlossom?: string
  
  // 大运信息
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
  }
  
  // 相互作用分析
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