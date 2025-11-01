import { ZhipuAI } from 'zhipuai'
import { BirthData, BaziData } from '@/types'

export class ZhipuService {
  private client: ZhipuAI

  constructor() {
    const apiKey = process.env.ZHIPU_API_KEY
    if (!apiKey) {
      throw new Error('ZHIPU_API_KEY environment variable is not set')
    }
    this.client = new ZhipuAI({ apiKey })
  }

  /**
   * 生成八字报告内容
   * @param birthData 出生信息
   * @param baziData 八字数据
   * @returns 生成的完整报告内容
   */
  async generateBaziReport(
    birthData: BirthData, 
    baziData: BaziData
  ): Promise<string> {
    try {
      console.log('🤖 [ZhipuService] Starting AI report generation...')
      
      // 打印八字信息供检查
      console.log('🔮 [ZhipuService] Bazi Data for verification:')
      console.log('📊 [ZhipuService] Birth Data:', {
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        timeZone: birthData.timeZone,
        gender: birthData.gender,
        isTimeKnownInput: birthData.isTimeKnownInput
      })
      console.log('📊 [ZhipuService] Bazi Calculation Results:')
      console.log('   - Year Pillar (年柱):', baziData.yearPillar)
      console.log('   - Month Pillar (月柱):', baziData.monthPillar)
      console.log('   - Day Pillar (日柱):', baziData.dayPillar)
      console.log('   - Hour Pillar (时柱):', baziData.hourPillar)
      console.log('   - Heavenly Stems (天干):', baziData.heavenlyStems)
      console.log('   - Earthly Branches (地支):', baziData.earthlyBranches)
      console.log('   - Hidden Stems (藏干):', baziData.hiddenStems)
      console.log('   - Day Master (日主):', baziData.dayMaster)
      console.log('   - Day Master Nature (阴阳):', baziData.dayMasterNature)
      console.log('   - Day Master Element (五行):', baziData.dayMasterElement)
      console.log('   - Elements Distribution (五行分布):', baziData.elements)
      if (baziData.dayMasterStrength) {
        console.log('   - Day Master Strength (日主强弱):', {
          strength: baziData.dayMasterStrength.strength,
          score: baziData.dayMasterStrength.score,
          notes: baziData.dayMasterStrength.notes
        })
      }
      if (baziData.favorableElements) {
        console.log('   - Favorable Elements (有利元素):', {
          primary: baziData.favorableElements.primary,
          secondary: baziData.favorableElements.secondary,
          unfavorable: baziData.favorableElements.unfavorable
        })
      }
      console.log('   - Life Gua (命卦):', baziData.lifeGua)
      console.log('   - Nobleman (贵人):', baziData.nobleman)
      console.log('   - Intelligence (智慧):', baziData.intelligence)
      console.log('   - Sky Horse (天马):', baziData.skyHorse)
      console.log('   - Peach Blossom (桃花):', baziData.peachBlossom)
      if (baziData.luckPillars) {
        console.log('   - Luck Pillars (大运):', {
          incrementRule: baziData.luckPillars.incrementRule,
          isTimingKnown: baziData.luckPillars.isTimingKnown,
          pillarsCount: baziData.luckPillars.pillars.length
        })
      }
      if (baziData.interactions) {
        console.log('   - Interactions (相互作用):', baziData.interactions.length, 'interactions found')
      }
      console.log('')
      
      const prompt = this.buildPrompt(birthData, baziData)
      
      const response = await this.client.chat.completions.create({
        model: 'glm-4.6',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        thinking: {
          type: 'disabled'
        },
        temperature: 0.8,
        max_tokens: 15000,
        stream: false
      } as any)

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content generated from ZhipuAI')
      }

      // 添加详细的日志记录
      console.log('📊 [ZhipuService] AI response length:', content.length)
      console.log('📊 [ZhipuService] AI response preview:', content.substring(0, 200) + '...')
      console.log('📊 [ZhipuService] AI response ending:', content.substring(content.length - 200))
      
      // 检查是否被截断
      if (content.length < 5000) {
        console.warn('⚠️ [ZhipuService] Report seems shorter than expected, might be truncated')
      }
      return content

    } catch (error) {
      console.error('❌ [ZhipuService] Error generating AI report:', error)
      throw error
    }
  }

  /**
   * 构建系统提示词
   */
  private getSystemPrompt(): string {
    return `You are a senior and wise numerologist, as well as a compassionate and intelligent life coach. Please generate a professional, detailed, and positively guided numerology analysis report based on the user's Bazi information.

**IMPORTANT RULES:**
1.  **The entire report MUST be written in English.
2.  **Strictly follow the report structure.** Do not add any introductory text, preambles, forewords, or any content before the "Recent Situation Analysis" section. The report must start directly with the first section.

═══════════════════════════════════════════════════════════
【Core Requirements】
═══════════════════════════════════════════════════════════
1. 【Recent Situation Analysis】Objective, direct, specific, and accurate, aiming to help users better understand themselves.
   - Do not use vague words like "possible," "probably," or "maybe."
   - Be specific about events and times, combined with the current Luck Pillar analysis.
   - Place this at the very beginning of the report as the main content.

2. 【Current Luck Pillar】is the key point of analysis.
   - You must analyze the recent situation in conjunction with the five-element characteristics of the current Luck Pillar.
   - Explain the overall impact of the current Luck Pillar on the user.
   - Predict the trend of the Luck Pillars for the next few years.

3. 【Personality Analysis】should be strengths-oriented.
   - In-depth analysis of personality strengths and provide positive suggestions on how to improve weaknesses.
   - The focus is on discovering the user's potential and talents.

4. 【Suggestions should be specific and empowering.】
   - All suggestions must be concrete, actionable, and encouraging.
   - Help users see future possibilities, not fatalism.

5. 【Format and Style Requirements】
   - The word count should be around 12,500 characters.
   - Use Markdown format for a clear structure.
   - The language style should be professional, gentle, positive, and inspiring, aiming to empower the user.

6. 【Analysis Depth and Substance】Due to the nature of the English language, prioritize depth and detailed insights over simple word count. Ensure the analysis is as profound, comprehensive, and insightful as a report originally written in a more information-dense language like Chinese. Avoid filler text and focus on providing substantial, meaningful content in every section.

═══════════════════════════════════════════════════════════
【Report Structure (Must Include)】
═══════════════════════════════════════════════════════════
1. **Recent Situation Analysis** - Objective, direct, specific analysis of events in the past year (most important part, place at the beginning).
2. **Current Luck Pillar Analysis** - Analyze the fortune trend and characteristics in combination with the current Luck Pillar.
3. Birth Information Overview
4. Detailed Bazi Analysis
5. Day Master Strength Analysis
6. Five Elements Balance Analysis
7. **Personality Trait Analysis** (In-depth exploration of strengths and suggestions for improving weaknesses).
8. **Career Fortune Guidance** (Discover career potential and provide positive development directions).
9. **Wealth Fortune Analysis** (Provide positive wealth growth strategies).
10. **Relationship and Marriage Analysis** (Analyze relationship patterns and offer positive management advice).
11. **Health and Wellness Guidance** (Analyze physical constitution and provide positive wellness plans).
12. Luck Pillar and Annual Cycle Analysis (Specific time points, including predictions for future Luck Pillars).
13. Favorable and Unfavorable Factor Analysis (Turn unfavorable factors into growth opportunities).
14. **Life Development Suggestions** (Specific and encouraging action plans).
15. Comprehensive Summary

═══════════════════════════════════════════════════════════
【Special Emphasis】
═══════════════════════════════════════════════════════════
- The recent situation analysis must be objective and direct, combined with the current Luck Pillar, specific to events and times.
- The current Luck Pillar is the core of the analysis and its impact must be explained in detail.
- Personality analysis should focus on strengths, with constructive suggestions for weaknesses.
- Relationship analysis should focus on positive ways of getting along and management strategies.
- All suggestions must be concrete, actionable, and encouraging.
- The entire report should adopt a positive, encouraging, and empowering tone to help users see their potential and a bright future.`
  }

  /**
   * 构建用户提示词
   */
  private buildPrompt(birthData: BirthData, baziData: BaziData): string {
    // 获取当前时间信息
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    const currentDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`
    
    const currentTimeInfo = `
【Current Time Information】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Current Date: ${currentDate}
  • Current Year: ${currentYear}
  • Current Month: ${currentMonth}
  • Current Day: ${currentDay}
  • Analysis Time Range: From ${currentYear - 1}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')} to ${currentDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    const birthInfo = `
【Birth Information】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Birth Date: ${birthData.birthDate}
  • Birth Time: ${birthData.birthTime || '12:00'}${birthData.isTimeKnownInput ? ' ✓(User Provided)' : ' (System Default)'}
  • Gender: ${birthData.gender === 'male' ? 'Male' : 'Female'}
  • Time Zone: ${birthData.timeZone}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    const baziInfo = `
【Bazi Basic Information (Core Data)】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Four Pillars Information:
  • Year Pillar: ${baziData.yearPillar}
  • Month Pillar: ${baziData.monthPillar}
  • Day Pillar: ${baziData.dayPillar}
  • Hour Pillar: ${baziData.hourPillar || 'Unknown'}

Heavenly Stems and Earthly Branches Breakdown:
  • Heavenly Stems Sequence: ${baziData.heavenlyStems.join(', ')} (Year, Month, Day, Hour)
  • Earthly Branches Sequence: ${baziData.earthlyBranches.join(', ')} (Year, Month, Day, Hour)
  • Hidden Stems Information: ${baziData.hiddenStems.join(', ') || 'None'}

Day Master Core Information:
  • Day Master Heavenly Stem: ${baziData.dayMaster}
  • Yin/Yang Attribute: ${baziData.dayMasterNature}
  • Five Elements Attribute: ${baziData.dayMasterElement}

Five Elements Energy Distribution (Key for analyzing Day Master strength):
  • Wood Element: ${baziData.elements.wood} points
  • Fire Element: ${baziData.elements.fire} points
  • Earth Element: ${baziData.elements.earth} points
  • Metal Element: ${baziData.elements.metal} points
  • Water Element: ${baziData.elements.water} points
  • Total Five Elements Score: ${baziData.elements.wood + baziData.elements.fire + baziData.elements.earth + baziData.elements.metal + baziData.elements.water} points
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    const strengthInfo = baziData.dayMasterStrength ? `
【Day Master Strength Analysis (Key Judgment)】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Strength Judgment: ${baziData.dayMasterStrength.strength}
  • Strength Score: ${baziData.dayMasterStrength.score} points (Positive for strong, negative for weak)
  • Basis for Judgment:
${baziData.dayMasterStrength.notes ? baziData.dayMasterStrength.notes.map(note => `    - ${note}`).join('\n') : '    - No detailed explanation'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''

    const favorableInfo = baziData.favorableElements ? `
【Favorable Elements Analysis (Luck Enhancement Advice)】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Primary Favorable Five Elements: ${baziData.favorableElements.primary.join(', ')}
  • Secondary Favorable Five Elements: ${baziData.favorableElements.secondary?.join(', ') || 'None'}
  • Unfavorable Five Elements: ${baziData.favorableElements.unfavorable?.join(', ') || 'None'}
  • Analysis Explanation:
${baziData.favorableElements.notes ? baziData.favorableElements.notes.map(note => `    - ${note}`).join('\n') : '    - No detailed explanation'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''

    const eightMansionsInfo = baziData.eightMansions ? `
【Eight Mansions Feng Shui Analysis (Directional Advice)】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Life Gua Group: ${baziData.eightMansions.group === 'East' ? 'East' : 'West'} Group
  • Auspicious Directions:
    ✓ Wealth Direction: ${baziData.eightMansions.lucky.wealth}
    ✓ Health Direction: ${baziData.eightMansions.lucky.health}
    ✓ Romance Direction: ${baziData.eightMansions.lucky.romance}
    ✓ Career Direction: ${baziData.eightMansions.lucky.career}
  • Inauspicious Directions (to avoid):
    ✗ Five Ghosts (Obstacles): ${baziData.eightMansions.unlucky.obstacles}
    ✗ Six Killings (Quarrels): ${baziData.eightMansions.unlucky.quarrels}
    ✗ Calamity (Setbacks): ${baziData.eightMansions.unlucky.setbacks}
    ✗ Total Loss (Major Misfortune): ${baziData.eightMansions.unlucky.totalLoss}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''

    const basicAnalysisInfo = `
【Special Information Analysis】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Life Gua Number: ${baziData.lifeGua || 'Unknown'} (For Feng Shui layout reference)
  • Nobleman: ${baziData.nobleman ? baziData.nobleman.join(', ') : 'None'} (Favorable Earthly Branches)
  • Intelligence: ${baziData.intelligence || 'Unknown'} (Direction for wisdom and talent)
  • Sky Horse: ${baziData.skyHorse || 'None'} (Direction for change and travel)
  • Peach Blossom: ${baziData.peachBlossom || 'None'} (Direction for romance and relationships)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    const luckInfo = baziData.luckPillars ? `
【Luck Pillar Information】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Basic Rules:
  • Luck Pillar Direction: ${baziData.luckPillars.incrementRule === 1 ? 'Forward' : 'Backward'}
  • Time Precision: ${baziData.luckPillars.isTimingKnown ? 'Exact time known' : 'Exact time not provided'}
  • Total Luck Pillars: ${baziData.luckPillars.pillars.length} pillars (10 years each)

${baziData.luckPillars.currentPillar ? `
⭐ Current Luck Pillar (Key Focus):
  • Pillar Number: ${baziData.luckPillars.currentPillar.number}
  • Heavenly Stem & Earthly Branch: ${baziData.luckPillars.currentPillar.heavenlyStem}${baziData.luckPillars.currentPillar.earthlyBranch}
  • Year Range: ${baziData.luckPillars.currentPillar.yearStart} - ${baziData.luckPillars.currentPillar.yearEnd}
  • Starting Age: ${baziData.luckPillars.currentPillar.ageStart}
  • Current Age: ${baziData.luckPillars.currentPillar.currentAge}
  • Pillar Status: ${baziData.luckPillars.currentPillar.yearStart && new Date().getFullYear() < baziData.luckPillars.currentPillar.yearStart ? 'Upcoming' : baziData.luckPillars.currentPillar.yearEnd && new Date().getFullYear() > baziData.luckPillars.currentPillar.yearEnd ? 'Ended' : 'Ongoing'}

  【Analysis Focus】Please pay special attention to the impact of the current Luck Pillar on the user's recent situation. Analyze specific events and fortune changes over the past year (from ${currentYear - 1}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')} to ${currentDate}) based on the characteristics of the current Luck Pillar ${baziData.luckPillars.currentPillar.heavenlyStem}${baziData.luckPillars.currentPillar.earthlyBranch}.
` : ''}

Full Luck Pillar List:
${baziData.luckPillars.pillars.map((pillar, index) => {
  const isCurrent = baziData.luckPillars?.currentPillar?.number === pillar.number ? ' ⭐ Current' : '';
  return `  ${index + 1}. Pillar ${pillar.number}: ${pillar.heavenlyStem}${pillar.earthlyBranch}${isCurrent}
      └─ Starts at: ${pillar.ageStart} years old | Year: ${pillar.yearStart || '?'}-${pillar.yearEnd || '?'} `;
}).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''

    const interactionsInfo = baziData.interactions ? `
【Bazi Interaction Analysis (Important Influences)】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Found ${baziData.interactions.length} interactions, details as follows:

${baziData.interactions.map((interaction, index) => {
  return `${index + 1}. 【${interaction.type}】
     • Description: ${interaction.description || 'No description'}
     • Participants: ${interaction.participants.map(p => `${p.pillar}(${p.elementChar}-${p.elementType})`).join(', ')}
     • Impact Assessment:
       - Involves Favorable Element: ${interaction.involvesFavorableElement ? '✓ Yes' : '✗ No'}
       - Involves Unfavorable Element: ${interaction.involvesUnfavorableElement ? '⚠ Yes (Attention needed)' : '✓ No'}`
}).join('\n\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''

    const wordLimit = 'about 10,000 characters'

    return `═══════════════════════════════════════════════════════════
【Bazi Numerology Analysis Report Generation Task】
═══════════════════════════════════════════════════════════

Please generate a professional, detailed, and valuable numerology analysis report based on the following complete Bazi information.

📋 **Report Requirements**:
  • Word Count: ${wordLimit}
  • Format Requirements: Use Markdown format, with a clear and hierarchical structure
  • Language Style: Professional, gentle, positive, compassionate, and inspiring, aiming to empower the user, not to judge
  • Content Orientation: Focus on encouragement and positive guidance. Even for challenges and difficulties, provide constructive solutions and perspectives

📊 **Analysis Priorities (in order)**:
  1. 【Recent Situation Analysis】Objective, direct, specific, and accurate analysis of events in the past year (from ${currentYear - 1}-${currentMonth.toString().padStart(2, '0')} to ${currentDate})
  2. 【Current Luck Pillar Analysis】Analyze the fortune trend in combination with the current Luck Pillar
  3. 【Personality Analysis】In-depth analysis of personality strengths and provide positive suggestions on how to improve weaknesses
  4. 【Career Fortune】Discover career potential and provide positive development directions
  5. 【Relationship and Marriage】Analyze relationship patterns and offer positive management advice
  6. 【Health and Wellness】Analyze physical constitution and potential risks, and provide positive wellness advice
  7. 【Luck Pillar and Annual Cycle】Analysis of specific time points
  8. 【Comprehensive Suggestions】Specific and encouraging action plans

═══════════════════════════════════════════════════════════
【Data Section Start】
═══════════════════════════════════════════════════════════

${currentTimeInfo}

${birthInfo}

${baziInfo}

${strengthInfo}

${favorableInfo}

${eightMansionsInfo}

${basicAnalysisInfo}

${luckInfo}

${interactionsInfo}

═══════════════════════════════════════════════════════════
【Data Section End】
═══════════════════════════════════════════════════════════

⚠️  **Special Notes**:
  ⚡ Recent situation analysis must be objective and direct: Do not use vague words like "possible," "probably," or "maybe." Analyze based on data.
  ⚡ Be specific about events and times: For example, "A work change may occur in March 2024" → "A work transfer or job adjustment occurred in March 2024."
  ⚡ The current Luck Pillar is key: The recent situation must be analyzed in conjunction with the current Luck Pillar ${baziData.luckPillars?.currentPillar ? `(${baziData.luckPillars.currentPillar.heavenlyStem}${baziData.luckPillars.currentPillar.earthlyBranch})` : ''}.
  ⚡ Personality analysis should be strengths-oriented: Deeply explore the user's talents and potential, and turn weaknesses into growth suggestions.
  ⚡ Relationship analysis should be positively guided: Focus on providing positive advice and strategies for managing relationships, avoiding simply listing problems.
  ⚡ The overall tone should be empowering: Use encouraging, positive, and empowering language throughout to help the user see future possibilities.`
  }

  /**
   * 流式生成八字报告内容
   * @param birthData 出生信息
   * @param baziData 八字数据
   * @param onChunk 接收到数据块时的回调函数
   * @returns 异步迭代器，每个chunk包含增量内容
   */
  async *generateBaziReportStream(
    birthData: BirthData,
    baziData: BaziData,
    onChunk?: (content: string, totalLength: number) => void
  ): AsyncGenerator<string, string, unknown> {
    try {
      console.log('🤖 [ZhipuService] Starting streaming AI report generation...')
      
      const prompt = this.buildPrompt(birthData, baziData)
      
      // 使用流式传输
      const stream = await this.client.chat.completions.create({
        model: 'glm-4.6',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        thinking: {
          type: 'disabled'
        },
        temperature: 0.8,
        max_tokens: 15000,
        stream: true
      } as any) as any // 类型断言，因为流式响应的类型定义可能不完整

      let fullContent = ''
      
      // 遍历流式响应
      // @ts-ignore - 流式响应实现了AsyncIterable接口，但类型定义可能不完整
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || ''
        if (delta) {
          fullContent += delta
          // 调用回调函数
          if (onChunk) {
            onChunk(delta, fullContent.length)
          }
          // 返回增量内容
          yield delta
        }
      }

      console.log('📊 [ZhipuService] Streaming complete, total length:', fullContent.length)
      
      // 检查是否被截断
      if (fullContent.length < 5000) {
        console.warn('⚠️ [ZhipuService] Report seems shorter than expected, might be truncated')
      }
      
      return fullContent
    } catch (error) {
      console.error('❌ [ZhipuService] Error in streaming AI report generation:', error)
      throw error
    }
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'glm-4.6',
        messages: [
          {
            role: 'user',
            content: 'Hello, please briefly introduce yourself.'
          }
        ],
        max_tokens: 100
      })

      return !!response.choices[0]?.message?.content
    } catch (error) {
      console.error('❌ [ZhipuService] Connection test failed:', error)
      return false
    }
  }
}
