import { BirthData, BaziData } from '@/types'
import { GoogleGenAI } from '@google/genai'

export class GeminiService {
  private static genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! })

  private static async generateContent(prompt: string): Promise<string> {
    try {
      const response = await GeminiService.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      })
      return response.text || 'No content generated'
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw new Error('Failed to generate content with Gemini API')
    }
  }

  // 生成预览报告（免费版本，500-800字）
  static async generatePreviewReport(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `As a senior Chinese astrologer, please generate a brief astrological preview report (500-800 words) based on the following information, in English:

## Birth Information
- Birth Date: ${birthData.birthDate}
- Birth Time: ${birthData.birthTime || 'Not provided'}${birthData.isTimeKnownInput ? ' (User provided)' : ' (System default 12:00)'}
- Gender: ${birthData.gender}
- Time Zone: ${birthData.timeZone}

## Bazi Information
- Heavenly Stems: ${baziData.heavenlyStems.join(', ')}
- Earthly Branches: ${baziData.earthlyBranches.join(', ')}
- Day Master: ${baziData.dayMaster}
- Five Elements Distribution: Wood ${baziData.elements.wood}, Fire ${baziData.elements.fire}, Earth ${baziData.elements.earth}, Metal ${baziData.elements.metal}, Water ${baziData.elements.water}

Please generate a preview report that includes:

# Your Astrological Overview

## Core Personality Traits
Briefly describe their 2-3 most prominent personality traits (around 150 words).

## Talents and Potential
Point out their main talents and strengths (around 150 words).

## Career Path
Briefly describe 1-2 most suitable career directions (around 150 words).

## Relationship Luck
Briefly analyze their relationship characteristics and provide suggestions (around 150 words).

---

**Want to learn more?**
The full report includes:
- In-depth personality analysis and growth advice
- Detailed career planning and wealth strategies
- Comprehensive relationship analysis and best matches
- Life mission and key turning points
- Personalized health and wellness plans
- And much more guidance tailored to you...

Unlock the full report now to begin your journey of destiny exploration!

Please write in a warm, engaging tone to make readers feel the charm of astrology and spark their interest in learning more. The report must be in English.`

    return await this.generateContent(prompt)
  }
  static async analyzePersonality(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `As a professional Chinese astrologer and psychologist, please conduct an in-depth personality analysis based on the following information, in English:

Birth Information:
- Birth Date: ${birthData.birthDate}
- Gender: ${birthData.gender}
- Time Zone: ${birthData.timeZone}

Bazi Information:
- Heavenly Stems: ${baziData.heavenlyStems.join(', ')}
- Earthly Branches: ${baziData.earthlyBranches.join(', ')}
- Day Master: ${baziData.dayMaster}
- Five Elements Distribution: Wood ${baziData.elements.wood}, Fire ${baziData.elements.fire}, Earth ${baziData.elements.earth}, Metal ${baziData.elements.metal}, Water ${baziData.elements.water}

Please generate a detailed personality analysis report, including:
1. Core personality traits and characteristics
2. Main strengths and talents
3. Areas for improvement and challenges
4. Social style and interpersonal relationship patterns
5. Emotional expression style
6. Learning and development suggestions
7. Leadership style and team role

Please answer in English. The language should be professional yet easy to understand, well-structured, and provide in-depth, practical content.`

    return await this.generateContent(prompt)
  }

  static async analyzeCareer(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `As a professional career planner and astrologer, please provide a career development analysis based on the following information, in English:

Birth Information:
- Birth Date: ${birthData.birthDate}
- Gender: ${birthData.gender}
- Time Zone: ${birthData.timeZone}

Bazi Information:
- Heavenly Stems: ${baziData.heavenlyStems.join(', ')}
- Earthly Branches: ${baziData.earthlyBranches.join(', ')}
- Day Master: ${baziData.dayMaster}
- Five Elements Distribution: Wood ${baziData.elements.wood}, Fire ${baziData.elements.fire}, Earth ${baziData.elements.earth}, Metal ${baziData.elements.metal}, Water ${baziData.elements.water}

Please generate a detailed career development analysis report, including:
1. Recommended most suitable career fields and industries
2. Entrepreneurial potential assessment and startup advice
3. Wealth accumulation strategies and financial advice
4. Ideal workplace environment and work style
5. Key opportunities and stages for career development
6. Specific suggestions for income improvement
7. Advice on handling workplace relationships

Please answer in English. The language should be professional yet easy to understand, providing specific, actionable advice.`

    return await this.generateContent(prompt)
  }

  static async analyzeRelationships(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `As a professional relationship counselor and astrologer, please provide a relationship analysis based on the following information, in English:

Birth Information:
- Birth Date: ${birthData.birthDate}
- Gender: ${birthData.gender}
- Time Zone: ${birthData.timeZone}

Bazi Information:
- Heavenly Stems: ${baziData.heavenlyStems.join(', ')}
- Earthly Branches: ${baziData.earthlyBranches.join(', ')}
- Day Master: ${baziData.dayMaster}
- Five Elements Distribution: Wood ${baziData.elements.wood}, Fire ${baziData.elements.fire}, Earth ${baziData.elements.earth}, Metal ${baziData.elements.metal}, Water ${baziData.elements.water}

Please generate a detailed relationship analysis report, including:
1. Love patterns and emotional preferences
2. Best match types and compatibility analysis
3. Communication style and expression methods
4. Core emotional needs and expectations
5. Marriage luck and long-term relationship advice
6. Ways of handling family relationships
7. Friendship and social patterns
8. Practical dating and relationship advice

Please answer in English. The language should be warm and practical, providing specific relationship guidance.`

    return await this.generateContent(prompt)
  }

  static async analyzeLifePath(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `As a professional spiritual mentor and astrologer, please provide a life mission analysis based on the following information, in English:

Birth Information:
- Birth Date: ${birthData.birthDate}
- Gender: ${birthData.gender}
- Time Zone: ${birthData.timeZone}

Bazi Information:
- Heavenly Stems: ${baziData.heavenlyStems.join(', ')}
- Earthly Branches: ${baziData.earthlyBranches.join(', ')}
- Day Master: ${baziData.dayMaster}
- Five Elements Distribution: Wood ${baziData.elements.wood}, Fire ${baziData.elements.fire}, Earth ${baziData.elements.earth}, Metal ${baziData.elements.metal}, Water ${baziData.elements.water}

Please generate a detailed life mission analysis report, including:
1. Core life mission and soul tasks
2. Main life lessons and learning themes
3. Life development stages and key turning points
4. Spiritual growth path and inner cultivation
5. Challenges to overcome and directions for transformation
6. Uncovering hidden talents and potential
7. Areas of legacy and contribution
8. Practical advice for soul growth

Please answer in English. The language should be spiritual and inspiring, providing deep life guidance.`

    return await this.generateContent(prompt)
  }

  static async analyzeHealth(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `As a professional traditional Chinese medicine wellness expert and astrologer, please provide a health analysis based on the following information, in English:

Birth Information:
- Birth Date: ${birthData.birthDate}
- Gender: ${birthData.gender}
- Time Zone: ${birthData.timeZone}

Bazi Information:
- Heavenly Stems: ${baziData.heavenlyStems.join(', ')}
- Earthly Branches: ${baziData.earthlyBranches.join(', ')}
- Day Master: ${baziData.dayMaster}
- Five Elements Distribution: Wood ${baziData.elements.wood}, Fire ${baziData.elements.fire}, Earth ${baziData.elements.earth}, Metal ${baziData.elements.metal}, Water ${baziData.elements.water}

Please generate a detailed health and wellness analysis report, including:
1. Constitutional characteristics and innate strengths
2. Health areas that need attention
3. Seasonal wellness tips (spring, summer, autumn, winter)
4. Suitable exercise methods and intensity
5. Dietary guidance and nutritional advice
6. Stress management and relaxation techniques
7. Methods for maintaining mental health
8. Recommendations for regular health check-ups
9. Daily wellness tips
10. Traditional Chinese medicine-based wellness and conditioning advice

Please answer in English, combining traditional Chinese medicine theory with modern health concepts to provide practical wellness guidance.`

    return await this.generateContent(prompt)
  }

  static async generateComprehensiveReport(birthData: BirthData, baziData: BaziData): Promise<{
    personality: string
    career: string
    relationships: string
    lifePath: string
    health: string
  }> {
    try {
      // Generate all analyses in parallel for better performance
      const [personality, career, relationships, lifePath, health] = await Promise.all([
        this.analyzePersonality(birthData, baziData),
        this.analyzeCareer(birthData, baziData),
        this.analyzeRelationships(birthData, baziData),
        this.analyzeLifePath(birthData, baziData),
        this.analyzeHealth(birthData, baziData)
      ])

      return {
        personality,
        career,
        relationships,
        lifePath,
        health
      }
    } catch (error) {
      console.error('Error generating comprehensive report:', error)
      throw new Error('Failed to generate report')
    }
  }

  // 新增：单次API调用生成完整报告
  static async generateSingleComprehensiveReport(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `As a senior Chinese astrologer, psychologist, career planner, relationship counselor, spiritual mentor, and traditional Chinese medicine wellness expert, please generate a comprehensive and detailed astrological analysis report based on the following information, in English:

## Birth Information
- Birth Date: ${birthData.birthDate}
- Birth Time: ${birthData.birthTime || 'Not provided'}${birthData.isTimeKnownInput ? ' (User provided)' : ' (System default 12:00)'}
- Gender: ${birthData.gender}
- Time Zone: ${birthData.timeZone}

## Bazi Information
- Heavenly Stems: ${baziData.heavenlyStems.join(', ')}
- Earthly Branches: ${baziData.earthlyBranches.join(', ')}
- Day Master: ${baziData.dayMaster}
- Five Elements Distribution: Wood ${baziData.elements.wood}, Fire ${baziData.elements.fire}, Earth ${baziData.elements.earth}, Metal ${baziData.elements.metal}, Water ${baziData.elements.water}

Please generate a detailed astrological analysis report of over 3000 words, including all of the following sections:

# I. Personality Trait Analysis
## Core Personality Traits
Detailed analysis of their personality traits, behavioral patterns, thinking styles, and emotional expression.

## Talents and Strengths
Analysis of their innate talents, abilities, and areas of strength.

## Areas for Improvement
Identifying aspects of their personality that need adjustment and refinement.

## Social Style
Analysis of their interpersonal skills and social preferences.

# II. Career Development Guidance
## Most Suitable Career Fields
Recommending the most suitable industries and career paths based on their Bazi.

## Entrepreneurial Potential Assessment
Analyzing their entrepreneurial abilities and suitable business ventures.

## Wealth Accumulation Strategies
Providing specific financial advice and wealth-building methods.

## Career Development Advice
Giving concrete steps and timing for career advancement.

# III. Relationship Analysis
## Love Patterns
Analyzing their approach to love and emotional expression.

## Best Match Types
Analyzing the most compatible partner types based on the principles of five elements.

## Marriage Luck
Analyzing marital prospects and providing long-term relationship advice.

## Family Relationships
Offering guidance on handling family relationships.

# IV. Life Mission and Growth
## Core Life Mission
Analyzing their life purpose and soul tasks.

## Life Development Stages
Describing the developmental focus at different ages.

## Spiritual Growth Path
Providing advice on inner cultivation and spiritual growth.

## Key Life Turning Points
Identifying important opportunities and turning points in life.

# V. Health and Wellness Guidance
## Constitutional Characteristics
Analyzing their innate physical constitution and health strengths.

## Health Areas to Focus On
Pointing out body parts and health issues that require special attention.

## Seasonal Wellness
Providing wellness advice for spring, summer, autumn, and winter.

## Exercise and Diet
Recommending suitable exercise methods and dietary adjustments.

## Mental Health
Providing methods for stress management and emotional regulation.

# VI. Comprehensive Advice and Summary
## Life Planning Suggestions
Giving comprehensive life planning advice based on the analysis.

## Recent Development Focus
Highlighting areas to focus on in the current stage.

## Long-term Development Goals
Setting long-term development goals for the next 3-5 years.

Please write in professional yet easy-to-understand English. The language should be warm and inspiring, with concrete, actionable content, avoiding clichés. Each section should have in-depth analysis and provide practical guidance. The report must be in English.`

    return await this.generateContent(prompt)
  }
}