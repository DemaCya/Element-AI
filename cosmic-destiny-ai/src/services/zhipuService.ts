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
        temperature: 0.9,
        max_tokens: 15000,
        stream: false
      })

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
    return `你是一位资深且直言不讳的命理师，精通中国传统八字命理学。请根据用户提供的八字信息，生成一份专业、详细、具体且尖锐的命理分析报告。

要求：
1. 使用直接、具体的语言，避免模糊和泛泛而谈
2. 对性格优势和劣势都要具体分析，不要回避问题
3. 近况分析要具体到可能发生的事件类型和时间
4. 保持专业性的同时，要敢于指出问题和挑战
5. 字数控制在10000字左右
6. 使用Markdown格式，结构清晰

报告结构：
1. **近况分析** - 具体分析过去一年可能发生的事件（放在最前面）
2. 出生信息概览
3. 八字详细分析
4. 日主强弱分析
5. 五行平衡分析
6. 性格特质分析（具体指出优势和劣势）
7. 事业运势指导（具体行业和方向）
8. 财富运势分析（具体理财建议）
9. 感情婚姻分析（具体感情模式和问题）
10. 健康养生指导（具体健康风险和建议）
11. 大运流年分析（具体时间节点）
12. 有利不利因素分析（具体因素和影响）
13. 人生发展建议（具体行动建议）
14. 综合总结

**特别要求**：
- 近况分析必须具体，不要用"可能"、"大概"等模糊词汇
- 性格分析要尖锐，既要指出优势也要指出劣势
- 所有建议都要具体可操作，不要泛泛而谈
- 敢于指出问题和挑战，但保持建设性
- 用词要直接、有力，避免过于温和的表达

请确保内容专业、准确、具体、有指导价值。`
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
【当前时间信息】
- 当前日期：${currentDate}
- 当前年份：${currentYear}年
- 当前月份：${currentMonth}月
- 当前日期：${currentDay}日
- 分析时间范围：${currentYear - 1}年${currentMonth}月${currentDay}日 至 ${currentDate}
`

    const birthInfo = `
【出生信息】
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '12:00'}${birthData.isTimeKnownInput ? ' (用户提供)' : ' (系统默认)'}
- 性别：${birthData.gender === 'male' ? '男' : '女'}
- 时区：${birthData.timeZone}
`

    const baziInfo = `
【八字基础信息】
- 年柱：${baziData.yearPillar}
- 月柱：${baziData.monthPillar}
- 日柱：${baziData.dayPillar}
- 时柱：${baziData.hourPillar || '未知'}

【天干地支】
- 天干：${baziData.heavenlyStems.join('、')}
- 地支：${baziData.earthlyBranches.join('、')}
- 藏干：${baziData.hiddenStems.join('、') || '无'}

【日主信息】
- 日主：${baziData.dayMaster}
- 阴阳：${baziData.dayMasterNature}
- 五行：${baziData.dayMasterElement}

【五行分布】
- 木：${baziData.elements.wood}
- 火：${baziData.elements.fire}
- 土：${baziData.elements.earth}
- 金：${baziData.elements.metal}
- 水：${baziData.elements.water}
`

    const strengthInfo = baziData.dayMasterStrength ? `
【日主强弱分析】
- 强弱程度：${baziData.dayMasterStrength.strength}
- 得分：${baziData.dayMasterStrength.score}
- 分析备注：${baziData.dayMasterStrength.notes ? baziData.dayMasterStrength.notes.join('；') : '无'}
` : ''

    const favorableInfo = baziData.favorableElements ? `
【有利元素分析】
- 主要有利：${baziData.favorableElements.primary.join('、')}
- 次要有利：${baziData.favorableElements.secondary?.join('、') || '无'}
- 不利元素：${baziData.favorableElements.unfavorable?.join('、') || '无'}
- 分析备注：${baziData.favorableElements.notes ? baziData.favorableElements.notes.join('；') : '无'}
` : ''

    const eightMansionsInfo = baziData.eightMansions ? `
【八宅分析】
- 命卦组别：${baziData.eightMansions.group}
- 吉方：
  * 财富：${baziData.eightMansions.lucky.wealth}
  * 健康：${baziData.eightMansions.lucky.health}
  * 感情：${baziData.eightMansions.lucky.romance}
  * 事业：${baziData.eightMansions.lucky.career}
- 凶方：
  * 五鬼：${baziData.eightMansions.unlucky.obstacles}
  * 六煞：${baziData.eightMansions.unlucky.quarrels}
  * 祸害：${baziData.eightMansions.unlucky.setbacks}
  * 绝命：${baziData.eightMansions.unlucky.totalLoss}
` : ''

    const basicAnalysisInfo = `
【基本分析】
- 命卦：${baziData.lifeGua || '未知'}
- 贵人：${baziData.nobleman ? baziData.nobleman.join('、') : '无'}
- 智慧：${baziData.intelligence || '未知'}
- 天马：${baziData.skyHorse || '无'}
- 桃花：${baziData.peachBlossom || '无'}
`

    const luckInfo = baziData.luckPillars ? `
【大运信息】
- 大运规则：${baziData.luckPillars.incrementRule === 1 ? '顺行' : '逆行'}
- 时间已知：${baziData.luckPillars.isTimingKnown ? '是' : '否'}
- 大运柱数：${baziData.luckPillars.pillars.length}个
- 大运详情：
${baziData.luckPillars.pillars.map((pillar, index) => 
  `  ${index + 1}. 第${pillar.number}步大运：${pillar.heavenlyStem}${pillar.earthlyBranch} (${pillar.ageStart}岁开始)`
).join('\n')}
` : ''

    const interactionsInfo = baziData.interactions ? `
【相互作用分析】
${baziData.interactions.map((interaction, index) => 
  `${index + 1}. ${interaction.type}：${interaction.description || '无描述'}
   - 参与者：${interaction.participants.map(p => `${p.pillar}(${p.elementChar})`).join('、')}
   - 涉及有利元素：${interaction.involvesFavorableElement ? '是' : '否'}
   - 涉及不利元素：${interaction.involvesUnfavorableElement ? '是' : '否'}`
).join('\n\n')}
` : ''

    const wordLimit = '10000字左右'

    return `请根据以下八字信息生成详细的命理分析报告，字数控制在${wordLimit}：

${currentTimeInfo}

${birthInfo}

${baziInfo}

${strengthInfo}

${favorableInfo}

${eightMansionsInfo}

${basicAnalysisInfo}

${luckInfo}

${interactionsInfo}

**重要提醒**：
- 近况分析必须具体，不要用"可能"、"大概"等模糊词汇
- 性格分析要尖锐，既要指出优势也要指出劣势
- 所有建议都要具体可操作，不要泛泛而谈
- 敢于指出问题和挑战，但保持建设性
- 用词要直接、有力，避免过于温和，模糊的表达`
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
            content: '你好，请简单介绍一下自己。'
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
