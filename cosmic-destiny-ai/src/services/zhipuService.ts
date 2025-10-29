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
        temperature: 0.7,
        max_tokens: 8000,
        stream: false
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content generated from ZhipuAI')
      }

      console.log('✅ [ZhipuService] AI report generated successfully')
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
    return `你是一位资深的命理师和人生指导师，精通中国传统八字命理学。你需要根据用户提供的完整八字信息，生成一份专业、详细、全面的命理分析报告。

要求：
1. 使用专业但通俗易懂的语言，避免过于晦涩的术语
2. 内容要实用，提供具体的人生指导建议
3. 保持积极正面的态度，但也要客观分析
4. 报告结构清晰，层次分明，内容丰富详实
5. 字数控制在8000字左右，确保内容充实
6. 使用Markdown格式，包含适当的标题和列表
7. 基于提供的所有八字信息进行深入分析

报告应包含以下详细部分：
1. **近况分析** - 根据八字信息分析一年内大概率发生过的事情（放在最前面）
2. 出生信息概览
3. 八字详细分析（天干地支、五行配置、藏干等）
4. 日主强弱分析
5. 五行平衡分析
6. 性格特质分析
7. 事业运势指导
8. 财富运势分析
9. 感情婚姻分析
10. 健康养生指导
11. 大运流年分析
12. 有利不利因素分析
13. 人生发展建议
14. 综合总结

**特别要求**：
- 近况分析必须放在报告的最前面，作为第一部分
- 基于八字信息、大运流年、五行变化等因素，分析过去一年内大概率发生的事件
- 包括但不限于：工作变动、感情变化、健康状况、财运起伏、人际关系变化等
- 分析要具体、合理，避免过于模糊的表述
- 使用积极正面的语言，即使分析到挑战也要给出建设性建议

请确保内容专业、准确、有指导价值，基于提供的所有八字数据进行全面分析。`
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

    const wordLimit = '8000字左右'

    return `请根据以下完整的八字信息和当前时间，生成一份详细的命理分析报告，字数控制在${wordLimit}：

${currentTimeInfo}

${birthInfo}

${baziInfo}

${strengthInfo}

${favorableInfo}

${eightMansionsInfo}

${basicAnalysisInfo}

${luckInfo}

${interactionsInfo}

请基于以上所有八字信息，生成一份专业、详细、全面的命理分析报告。**特别注意：近况分析必须放在报告的最前面！**

报告应包含以下部分（按顺序）：

1. **近况分析** - 根据八字信息和当前时间分析前一年大概率发生过的事情
   - 基于当前时间（${currentYear}年${currentMonth}月${currentDay}日），分析前一年（${currentYear - 1}年${currentMonth}月${currentDay}日 至 ${currentDate}）的事件
   - 基于大运流年、五行变化、天干地支相互作用等因素
   - 分析过去一年内在工作、感情、健康、财运、人际关系等方面可能发生的事件
   - 包括具体的事件类型、发生概率、影响程度等
   - 使用积极正面的语言，即使遇到挑战也要给出建设性建议

2. **出生信息概览** - 简要介绍出生信息
3. **八字详细分析** - 深入分析天干地支、五行配置
4. **日主强弱分析** - 分析日主的强弱程度和影响因素
5. **五行平衡分析** - 分析五行分布和平衡状况
6. **性格特质分析** - 基于八字分析性格特征
7. **事业运势指导** - 职业发展和事业建议
8. **财富运势分析** - 财运分析和理财建议
9. **感情婚姻分析** - 感情模式和婚姻建议
10. **健康养生指导** - 体质分析和健康建议
11. **大运流年分析** - 人生各阶段运势分析
12. **有利不利因素** - 分析有利和不利的因素
13. **人生发展建议** - 综合的人生指导建议
14. **综合总结** - 整体评价和总结

**重要提醒**：
- 近况分析是报告的核心亮点，必须放在最前面
- 基于八字信息进行合理的推测和分析
- 分析要具体、有针对性，避免泛泛而谈
- 保持专业性和准确性，同时使用通俗易懂的语言`
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
