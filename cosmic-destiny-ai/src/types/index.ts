export interface BirthData {
  birthDate: string
  birthTime?: string
  timeZone: string
  gender: 'male' | 'female' | 'other'
}

export interface BaziData {
  heavenlyStems: string[]
  earthlyBranches: string[]
  hiddenStems: string[]
  elements: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  dayMaster: string
  yearPillar: string
  monthPillar: string
  dayPillar: string
  hourPillar?: string
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