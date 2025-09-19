import { BirthData, BaziData } from '@/types'

export class BaziService {
  static async calculateBazi(birthData: BirthData): Promise<BaziData> {
    try {
      // Import the bazi calculator dynamically to avoid SSR issues
      const { default: BaziCalculator } = await import('@aharris02/bazi-calculator-by-alvamind')

      // Create bazi calculator instance
      const calculator = new BaziCalculator({
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime || '12:00',
        timezone: birthData.timeZone,
        gender: birthData.gender
      })

      // Calculate bazi
      const result = calculator.calculate()

      // Map the result to our BaziData interface
      const baziData: BaziData = {
        heavenlyStems: result.pillars.map((p: any) => p.heavenlyStem),
        earthlyBranches: result.pillars.map((p: any) => p.earthlyBranch),
        hiddenStems: result.pillars.map((p: any) => p.hiddenStems).flat(),
        elements: {
          wood: result.elements.wood || 0,
          fire: result.elements.fire || 0,
          earth: result.elements.earth || 0,
          metal: result.elements.metal || 0,
          water: result.elements.water || 0
        },
        dayMaster: result.dayMaster,
        yearPillar: result.pillars[0]?.pillar || '',
        monthPillar: result.pillars[1]?.pillar || '',
        dayPillar: result.pillars[2]?.pillar || '',
        hourPillar: result.pillars[3]?.pillar
      }

      return baziData
    } catch (error) {
      console.error('Error calculating Bazi:', error)
      throw new Error('Failed to calculate Bazi. Please check your birth information.')
    }
  }

  static getElementAnalysis(elements: BaziData['elements']): string {
    const total = Object.values(elements).reduce((sum, val) => sum + val, 0)
    if (total === 0) return 'Balanced elements'

    const percentages = {
      wood: Math.round((elements.wood / total) * 100),
      fire: Math.round((elements.fire / total) * 100),
      earth: Math.round((elements.earth / total) * 100),
      metal: Math.round((elements.metal / total) * 100),
      water: Math.round((elements.water / total) * 100)
    }

    // Find dominant element
    const dominant = Object.entries(percentages).reduce((a, b) =>
      percentages[a[0] as keyof typeof percentages] > percentages[b[0] as keyof typeof percentages] ? a : b
    )[0]

    const elementNames = {
      wood: 'Wood (木)',
      fire: 'Fire (火)',
      earth: 'Earth (土)',
      metal: 'Metal (金)',
      water: 'Water (水)'
    }

    return `Dominant Element: ${elementNames[dominant as keyof typeof elementNames]} (${percentages[dominant as keyof typeof percentages]}%)`
  }

  static getDayMasterCharacteristics(dayMaster: string): string {
    const characteristics: { [key: string]: string } = {
      '甲': 'Natural leader, ambitious, and straightforward. You have strong wood element energy.',
      '乙': 'Gentle, adaptable, and cooperative. You possess flexible wood energy.',
      '丙': 'Energetic, enthusiastic, and outgoing. You radiate fire energy.',
      '丁': 'Warm, thoughtful, and detail-oriented. You have gentle fire energy.',
      '戊': 'Reliable, stable, and practical. You embody earth element energy.',
      '己': 'Nurturing, supportive, and humble. You have receptive earth energy.',
      '庚': 'Determined, disciplined, and righteous. You possess strong metal energy.',
      '辛': 'Elegant, precise, and detail-oriented. You have refined metal energy.',
      '壬': 'Resourceful, adaptable, and intelligent. You flow with water energy.',
      '癸': 'Intuitive, gentle, and compassionate. You have deep water energy.'
    }

    return characteristics[dayMaster] || 'Unique individual with special cosmic energy.'
  }
}