import { BirthData, BaziData, ReportSection } from '@/types'
import { BaziService } from './baziService'
import { GeminiService } from './geminiService'

export class ReportService {
  static async generateReport(birthData: BirthData, baziData: BaziData): Promise<ReportSection[]> {
    const sections: ReportSection[] = []

    // Generate comprehensive report content
    const reportContent = await GeminiService.generateComprehensiveReport(birthData, baziData)

    // Personality Analysis
    sections.push({
      title: "Personality Analysis",
      content: reportContent.personality,
      preview: true
    })

    // Career & Finance
    sections.push({
      title: "Career & Finance Guidance",
      content: reportContent.career,
      preview: true
    })

    // Relationships & Love
    sections.push({
      title: "Relationships & Love",
      content: reportContent.relationships,
      preview: false
    })

    // Life Path & Destiny
    sections.push({
      title: "Life Path & Destiny",
      content: reportContent.lifePath,
      preview: false
    })

    // Health & Wellness
    sections.push({
      title: "Health & Wellness",
      content: reportContent.health,
      preview: false
    })

    return sections
  }

  private static async generatePersonalityAnalysis(birthData: BirthData, baziData: BaziData): Promise<string> {
    const dayMasterTraits = BaziService.getDayMasterCharacteristics(baziData.dayMaster)
    const elementAnalysis = BaziService.getElementAnalysis(baziData.elements)

    return `Based on your Bazi chart analysis, your personality reveals fascinating cosmic insights:

**Your Day Master: ${baziData.dayMaster}**
${dayMasterTraits}

**Elemental Balance**
${elementAnalysis}

**Core Personality Traits**
Your Bazi chart shows a unique combination of heavenly stems and earthly branches that shape your fundamental character. The interaction between ${baziData.heavenlyStems.join(', ')} and ${baziData.earthlyBranches.join(', ')} creates a distinctive personality pattern.

**Strengths and Challenges**
Your chart indicates natural talents in areas influenced by your dominant element. You may find yourself particularly skilled in ${this.getElementBasedStrengths(baziData.elements)}. However, be mindful of potential challenges related to element imbalances.

**Social Dynamics**
In social situations, you tend to ${this.getSocialStyle(baziData.dayMaster)}. Your communication style is influenced by the cosmic energies present at your birth time.`
  }

  private static async generateCareerAnalysis(birthData: BirthData, baziData: BaziData): Promise<string> {
    const suitableCareers = this.getCareerSuggestions(baziData)
    const wealthElements = this.getWealthElements(baziData)

    return `Your cosmic blueprint reveals significant insights into your professional path and financial potential:

**Career Directions**
Based on your element composition and day master, you may find fulfillment in careers such as:
${suitableCareers.map(career => `- ${career}`).join('\n')}

**Wealth Potential**
Your wealth elements are ${wealthElements.join(' and ')}. This suggests that financial opportunities may arise through ${this.getWealthStrategy(wealthElements)}.

**Timing and Opportunities**
The cosmic cycles indicate favorable periods for career advancement during ${this.getFavorablePeriods(baziData)}. Pay attention to these time frames for making important professional decisions.

**Work Environment**
You thrive best in environments that ${this.getIdealWorkEnvironment(baziData.elements)}. Consider this when evaluating job opportunities or business ventures.`
  }

  private static async generateRelationshipAnalysis(birthData: BirthData, baziData: BaziData): Promise<string> {
    const compatibility = this.getCompatibilityInsights(baziData)
    const loveStyle = this.getLoveStyle(baziData.dayMaster)

    return `The cosmic energies at your birth time create a unique pattern for your relationship dynamics:

**Love and Romance**
Your approach to love is characterized by ${loveStyle}. You seek connections that ${this.getRelationshipNeeds(baziData.elements)}.

**Compatibility Patterns**
You tend to have natural harmonious connections with individuals whose elements complement yours: ${compatibility.join(', ')}.

**Communication Style**
In relationships, you express yourself through ${this.getCommunicationStyle(baziData.heavenlyStems)}. Your partner appreciates your ${this.getCommunicationStrengths(baziData)}.

**Long-term Potential**
Your chart suggests that lasting relationships are built on ${this.getRelationshipFoundation(baziData)}. The most fulfilling partnerships for you involve ${this.getIdealPartnership(baziData)}.`
  }

  private static async generateLifePathAnalysis(birthData: BirthData, baziData: BaziData): Promise<string> {
    const lifePurpose = this.getLifePurpose(baziData)
    const challenges = this.getLifeChallenges(baziData)

    return `Your Bazi chart reveals profound insights into your soul's journey and life purpose:

**Life Purpose and Mission**
The cosmic alignment at your birth suggests you are here to ${lifePurpose}. Your unique combination of elements creates a special destiny path.

**Life Lessons and Growth**
Your chart indicates important lessons around ${challenges.join(', ')}. These challenges are opportunities for profound personal evolution.

**Timing and Destiny**
Significant life transitions tend to occur during ${this.getLifeTransitions(baziData)}. These periods mark important milestones in your cosmic journey.

**Spiritual Growth**
Your spiritual path is enhanced by ${this.getSpiritualInsights(baziData.elements). Meditation, self-reflection, and connecting with nature will support your spiritual development.`
  }

  private static async generateHealthAnalysis(birthData: BirthData, baziData: BaziData): Promise<string> {
    const healthFocus = this.getHealthFocus(baziData.elements)
    const seasonalAdvice = this.getSeasonalHealthAdvice(baziData)

    return `Your elemental composition provides valuable insights for maintaining optimal health and wellness:

**Constitutional Strengths**
Your dominant element ${this.getStrongestElement(baziData.elements)} gives you natural resilience in ${healthFocus}.

**Areas of Attention**
Pay special attention to ${this.getHealthVulnerabilities(baziData.elements)}. Regular check-ups and preventive care in these areas are recommended.

**Seasonal Considerations**
${seasonalAdvice}

**Lifestyle Recommendations**
For optimal wellness, consider incorporating ${this.getLifestyleRecommendations(baziData)} into your daily routine. Your body responds best to ${this.getWellnessApproach(baziData.dayMaster)}.`
  }

  // Helper methods for generating specific insights
  private static getElementBasedStrengths(elements: BaziData['elements']): string {
    const strongest = Object.entries(elements).reduce((a, b) => elements[a[0] as keyof typeof elements] > elements[b[0] as keyof typeof elements] ? a : b)[0]
    const strengths: { [key: string]: string } = {
      wood: 'creativity, growth, and leadership',
      fire: 'communication, inspiration, and passion',
      earth: 'stability, nurturing, and practicality',
      metal: 'precision, discipline, and organization',
      water: 'intuition, adaptability, and wisdom'
    }
    return strengths[strongest as keyof typeof strengths] || 'various areas'
  }

  private static getSocialStyle(dayMaster: string): string {
    const styles: { [key: string]: string } = {
      '甲': 'taking charge and leading discussions',
      '乙': 'diplomatically mediating and finding common ground',
      '丙': 'energetically engaging and inspiring others',
      '丁': 'thoughtfully listening and offering gentle guidance',
      '戊': 'providing stability and being the reliable anchor',
      '己': 'nurturing others and creating harmonious environments',
      '庚': 'being direct and maintaining clear boundaries',
      '辛': 'paying attention to details and elegance in interaction',
      '壬': 'adapting to different social flows and reading the room',
      '癸': 'sensing underlying emotions and offering deep empathy'
    }
    return styles[dayMaster] || 'being your authentic self'
  }

  private static getCareerSuggestions(baziData: BaziData): string[] {
    const dominant = Object.entries(baziData.elements).reduce((a, b) =>
      baziData.elements[a[0] as keyof typeof baziData.elements] > baziData.elements[b[0] as keyof typeof baziData.elements] ? a : b
    )[0]

    const careers: { [key: string]: string[] } = {
      wood: ['Education', 'Environmental Science', 'Writing', 'Design', 'Coaching'],
      fire: ['Marketing', 'Entertainment', 'Public Speaking', 'Technology', 'Sales'],
      earth: ['Healthcare', 'Real Estate', 'Hospitality', 'Counseling', 'Administration'],
      metal: ['Finance', 'Engineering', 'Law', 'Military', 'Quality Control'],
      water: ['Research', 'Psychology', 'Arts', 'Consulting', 'Spiritual Guidance']
    }

    return careers[dominant as keyof typeof careers] || ['Entrepreneurship', 'Consulting', 'Creative Fields']
  }

  private static getWealthElements(baziData: BaziData): string[] {
    // Simplified wealth element determination
    const wealthIndicators = []
    if (baziData.elements.water > 0) wealthIndicators.push('Water')
    if (baziData.elements.earth > 0) wealthIndicators.push('Earth')
    return wealthIndicators.length > 0 ? wealthIndicators : ['traditional approaches']
  }

  private static getWealthStrategy(elements: string[]): string {
    if (elements.includes('Water')) return 'intuitive investments and flowing with market trends'
    if (elements.includes('Earth')) return 'stable, long-term investments and property'
    return 'balanced and diversified approaches'
  }

  private static getFavorablePeriods(baziData: BaziData): string {
    return 'periods when your supporting elements are strong, typically during certain seasons and lunar phases'
  }

  private static getIdealWorkEnvironment(elements: BaziData['elements']): string {
    if (elements.wood > elements.metal) return 'collaborative and growing environments'
    if (elements.fire > elements.water) return 'dynamic and energetic settings'
    return 'structured and stable environments'
  }

  private static getCompatibilityInsights(baziData: BaziData): string[] {
    return ['complementary elemental energies', 'supportive earthly branches', 'harmonious heavenly stems']
  }

  private static getLoveStyle(dayMaster: string): string {
    const styles: { [key: string]: string } = {
      '甲': 'passionate and protective affection',
      '乙': 'gentle and adaptable love',
      '丙': 'enthusiastic and expressive romance',
      '丁': 'warm and thoughtful devotion',
      '戊': 'steadfast and reliable commitment',
      '己': 'nurturing and supportive care',
      '庚': 'disciplined and loyal dedication',
      '辛': 'refined and elegant affection',
      '壬': 'deep and intuitive connection',
      '癸': 'sensitive and compassionate bond'
    }
    return styles[dayMaster] || 'unique and authentic connection'
  }

  private static getRelationshipNeeds(elements: BaziData['elements']): string {
    if (elements.wood > elements.metal) return 'growth, learning, and shared development'
    if (elements.fire > elements.water) return 'passion, excitement, and inspiration'
    return 'stability, security, and mutual support'
  }

  private static getCommunicationStyle(stems: string[]): string {
    return stems.includes('丙') || stems.includes('丁') ? 'warmth and expressiveness' : 'thoughtfulness and precision'
  }

  private static getCommunicationStrengths(baziData: BaziData): string {
    return 'clarity, authenticity, and the ability to connect on multiple levels'
  }

  private static getRelationshipFoundation(baziData: BaziData): string {
    return 'mutual respect, understanding, and shared values'
  }

  private static getIdealPartnership(baziData: BaziData): string {
    return 'balance, growth, and complementary energies'
  }

  private static getLifePurpose(baziData: BaziData): string {
    const dominant = Object.entries(baziData.elements).reduce((a, b) =>
      baziData.elements[a[0] as keyof typeof baziData.elements] > baziData.elements[b[0] as keyof typeof baziData.elements] ? a : b
    )[0]

    const purposes: { [key: string]: string } = {
      wood: 'create growth and inspire others',
      fire: 'bring light and warmth to the world',
      earth: 'provide stability and nurture community',
      metal: 'establish order and uphold justice',
      water: 'flow with wisdom and guide transformation'
    }

    return purposes[dominant as keyof typeof purposes] || 'express your unique cosmic signature'
  }

  private static getLifeChallenges(baziData: BaziData): string[] {
    return ['self-awareness', 'balance', 'integration of opposites']
  }

  private static getLifeTransitions(baziData: BaziData): string {
    return 'significant lunar cycles, elementally charged seasons, and personal year cycles'
  }

  private static getSpiritualInsights(elements: BaziData['elements']): string {
    if (elements.water > elements.fire) return 'meditation, introspection, and flowing with universal energy'
    if (elements.fire > elements.water) return 'active spiritual practice, service, and radiating light'
    return 'grounded practices, connection to nature, and mindful presence'
  }

  private static getHealthFocus(elements: BaziData['elements']): string {
    const strongest = this.getStrongestElement(elements)
    const focus: { [key: string]: string } = {
      wood: 'immune system and detoxification',
      fire: 'cardiovascular health and circulation',
      earth: 'digestive system and metabolism',
      metal: 'respiratory system and skin health',
      water: 'kidney health and hormonal balance'
    }
    return focus[strongest] || 'overall vitality and balance'
  }

  private static getHealthVulnerabilities(elements: BaziData['elements']): string {
    const weaknesses = []
    if (elements.wood < elements.metal) weaknesses.push('stress management and flexibility')
    if (elements.fire < elements.water) weaknesses.push('circulation and warmth')
    if (elements.earth < elements.wood) weaknesses.push('digestive harmony and grounding')
    return weaknesses.join(', ')
  }

  private static getSeasonalHealthAdvice(baziData: BaziData): string {
    return 'Adjust your lifestyle according to seasonal changes. Spring supports wood element rejuvenation, summer ignites fire element energy, autumn balances metal element clarity, and winter nourishes water element wisdom.'
  }

  private static getLifestyleRecommendations(baziData: BaziData): string {
    const recommendations = []
    if (baziData.elements.wood > 0) recommendations.push('outdoor activities and creative pursuits')
    if (baziData.elements.fire > 0) recommendations.push('regular exercise and social engagement')
    if (baziData.elements.earth > 0) recommendations.push('routine and nourishing meals')
    if (baziData.elements.metal > 0) recommendations.push('structured schedules and organization')
    if (baziData.elements.water > 0) recommendations.push('rest, reflection, and hydration')
    return recommendations.join(', ')
  }

  private static getWellnessApproach(dayMaster: string): string {
    const approaches: { [key: string]: string } = {
      '甲': 'active, goal-oriented wellness practices',
      '乙': 'gentle, flexible health routines',
      '丙': 'energetic, varied physical activities',
      '丁': 'mindful, moderate exercise',
      '戊': 'consistent, structured health habits',
      '己': 'nurturing, supportive self-care',
      '庚': 'disciplined, targeted fitness',
      '辛': 'precise, elegant wellness rituals',
      '壬': 'adaptive, intuitive health choices',
      '癸': 'restorative, deep-healing practices'
    }
    return approaches[dayMaster] || 'balanced and personalized wellness approach'
  }

  private static getStrongestElement(elements: BaziData['elements']): string {
    return Object.entries(elements).reduce((a, b) =>
      elements[a[0] as keyof typeof elements] > elements[b[0] as keyof typeof elements] ? a : b
    )[0]
  }
}