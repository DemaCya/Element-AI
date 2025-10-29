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
          type: 'enabled'
        },
        temperature: 0.8,
        max_tokens: 12000,
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
    return `你是一位资深且智慧的命理师，同时也是一位充满同情心和智慧的人生导师。请根据用户提供的八字信息，生成一份专业、详细且充满积极引导的命理分析报告。

═══════════════════════════════════════════════════════════
【核心要求】
═══════════════════════════════════════════════════════════
1. 【近况分析】客观直接，具体准确，旨在帮助用户更好地理解自己
   - 不要用"可能"、"大概"、"也许"等模糊词汇
   - 要具体到事件和时间，结合当前大运分析
   - 放在报告最前面，作为重点内容

2. 【当前大运】是关键分析点
   - 必须结合当前大运的五行特点分析近况
   - 说明当前大运对用户的整体影响
   - 预测未来几年的大运走势

3. 【性格分析】要以优势为导向
   - 深入分析性格优势，并就如何改善劣势提供积极建议
   - 重点是发掘用户的潜能和天赋

4. 【建议要具体且赋能】
   - 所有建议都要具体可操作，并充满鼓励性
   - 帮助用户看到未来的可能性，而不是宿命论

5. 【格式与风格要求】
   - 字数控制在10000字左右
   - 使用Markdown格式，结构清晰
   - 语言风格专业、温和、积极、富有启发性，旨在赋能用户

═══════════════════════════════════════════════════════════
【报告结构（必须包含）】
═══════════════════════════════════════════════════════════
1. **近况分析** - 客观直接，具体分析过去一年发生的事件（最重要的部分，放最前面）
2. **当前大运分析** - 结合当前大运分析运势走向和特点
3. 出生信息概览
4. 八字详细分析
5. 日主强弱分析
6. 五行平衡分析
7. **性格特质分析**（深入挖掘优势，并提供劣势的改进建议）
8. **事业运势指导**（发掘职业潜能，提供积极发展方向）
9. **财富运势分析**（提供积极的财富增长策略）
10. **感情婚姻分析**（分析感情模式，并提出积极的经营建议）
11. **健康养生指导**（分析体质特点，提供积极的养生方案）
12. 大运流年分析（具体时间节点，包括未来大运预测）
13. 有利不利因素分析（将不利因素转化为成长机会）
14. **人生发展建议**（具体且充满鼓励的行动建议）
15. 综合总结

═══════════════════════════════════════════════════════════
【特别强调】
═══════════════════════════════════════════════════════════
- 近况分析要客观直接，结合当前大运，具体到事件和时间
- 当前大运是分析的核心，必须详细说明其影响
- 性格分析要以优势为主，劣势部分要提供建设性意见
- 感情分析要聚焦于积极的相处之道和经营策略
- 所有建议都要具体可操作，并充满鼓励性
- 通篇采用积极、鼓励和赋能的语言风格，帮助用户看到自身潜力和未来的光明前景。`
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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • 当前日期：${currentDate}
  • 当前年份：${currentYear}年
  • 当前月份：${currentMonth}月
  • 当前日期：${currentDay}日
  • 分析时间范围：${currentYear - 1}年${currentMonth}月${currentDay}日 至 ${currentDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    const birthInfo = `
【出生信息】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • 出生日期：${birthData.birthDate}
  • 出生时间：${birthData.birthTime || '12:00'}${birthData.isTimeKnownInput ? ' ✓(用户提供)' : ' (系统默认)'}
  • 性别：${birthData.gender === 'male' ? '男' : '女'}
  • 时区：${birthData.timeZone}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    const baziInfo = `
【八字基础信息（核心数据）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
四柱信息：
  • 年柱：${baziData.yearPillar}
  • 月柱：${baziData.monthPillar}
  • 日柱：${baziData.dayPillar}
  • 时柱：${baziData.hourPillar || '未知'}

天干地支分解：
  • 天干序列：${baziData.heavenlyStems.join('、')}（年干、月干、日干、时干）
  • 地支序列：${baziData.earthlyBranches.join('、')}（年支、月支、日支、时支）
  • 藏干信息：${baziData.hiddenStems.join('、') || '无'}

日主核心信息：
  • 日主天干：${baziData.dayMaster}
  • 阴阳属性：${baziData.dayMasterNature === 'Yang' ? '阳' : '阴'}
  • 五行属性：${baziData.dayMasterElement === 'WOOD' ? '木' : baziData.dayMasterElement === 'FIRE' ? '火' : baziData.dayMasterElement === 'EARTH' ? '土' : baziData.dayMasterElement === 'METAL' ? '金' : '水'}

五行能量分布（分析日主强弱的关键）：
  • 木元素：${baziData.elements.wood} 分
  • 火元素：${baziData.elements.fire} 分
  • 土元素：${baziData.elements.earth} 分
  • 金元素：${baziData.elements.metal} 分
  • 水元素：${baziData.elements.water} 分
  • 五行总分：${baziData.elements.wood + baziData.elements.fire + baziData.elements.earth + baziData.elements.metal + baziData.elements.water} 分
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    const strengthInfo = baziData.dayMasterStrength ? `
【日主强弱分析（关键判断）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • 强弱判断：${baziData.dayMasterStrength.strength === 'Strong' ? '强' : baziData.dayMasterStrength.strength === 'Weak' ? '弱' : '平衡'}
  • 强弱得分：${baziData.dayMasterStrength.score} 分（正数为强，负数为弱）
  • 判断依据：
${baziData.dayMasterStrength.notes ? baziData.dayMasterStrength.notes.map(note => `    - ${note}`).join('\n') : '    - 无详细说明'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''

    const favorableInfo = baziData.favorableElements ? `
【有利元素分析（补运建议）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • 主要有利五行：${baziData.favorableElements.primary.map(e => {
    const map = { 'WOOD': '木', 'FIRE': '火', 'EARTH': '土', 'METAL': '金', 'WATER': '水' };
    return map[e as keyof typeof map] || e;
  }).join('、')}
  • 次要有利五行：${baziData.favorableElements.secondary?.map(e => {
    const map = { 'WOOD': '木', 'FIRE': '火', 'EARTH': '土', 'METAL': '金', 'WATER': '水' };
    return map[e as keyof typeof map] || e;
  }).join('、') || '无'}
  • 不利五行：${baziData.favorableElements.unfavorable?.map(e => {
    const map = { 'WOOD': '木', 'FIRE': '火', 'EARTH': '土', 'METAL': '金', 'WATER': '水' };
    return map[e as keyof typeof map] || e;
  }).join('、') || '无'}
  • 分析说明：
${baziData.favorableElements.notes ? baziData.favorableElements.notes.map(note => `    - ${note}`).join('\n') : '    - 无详细说明'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''

    const eightMansionsInfo = baziData.eightMansions ? `
【八宅风水分析（方位建议）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • 命卦组别：${baziData.eightMansions.group === 'East' ? '东四命' : '西四命'}
  • 吉利方位：
    ✓ 财富方位：${baziData.eightMansions.lucky.wealth}
    ✓ 健康方位：${baziData.eightMansions.lucky.health}
    ✓ 感情方位：${baziData.eightMansions.lucky.romance}
    ✓ 事业方位：${baziData.eightMansions.lucky.career}
  • 不利方位（需避开）：
    ✗ 五鬼方（阻碍）：${baziData.eightMansions.unlucky.obstacles}
    ✗ 六煞方（口舌）：${baziData.eightMansions.unlucky.quarrels}
    ✗ 祸害方（挫折）：${baziData.eightMansions.unlucky.setbacks}
    ✗ 绝命方（大凶）：${baziData.eightMansions.unlucky.totalLoss}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''

    const basicAnalysisInfo = `
【特殊信息分析】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • 生命卦数：${baziData.lifeGua || '未知'}（用于风水布局参考）
  • 天乙贵人：${baziData.nobleman ? baziData.nobleman.join('、') : '无'}（有利地支）
  • 文昌智慧：${baziData.intelligence || '未知'}（聪明才智方位）
  • 天马星：${baziData.skyHorse || '无'}（变动迁移方向）
  • 桃花位：${baziData.peachBlossom || '无'}（感情人缘方位）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    const luckInfo = baziData.luckPillars ? `
【大运信息】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
基础规则：
  • 大运方向：${baziData.luckPillars.incrementRule === 1 ? '顺行（向前）' : '逆行（向后）'}
  • 时间精度：${baziData.luckPillars.isTimingKnown ? '已知确切时间' : '未提供确切时间'}
  • 大运总数：${baziData.luckPillars.pillars.length}步（每步10年）

${baziData.luckPillars.currentPillar ? `
⭐ 当前大运（重点关注）：
  • 大运编号：第${baziData.luckPillars.currentPillar.number}步
  • 天干地支：${baziData.luckPillars.currentPillar.heavenlyStem}${baziData.luckPillars.currentPillar.earthlyBranch}
  • 年份范围：${baziData.luckPillars.currentPillar.yearStart}年 - ${baziData.luckPillars.currentPillar.yearEnd}年
  • 起运年龄：${baziData.luckPillars.currentPillar.ageStart}岁
  • 当前年龄：${baziData.luckPillars.currentPillar.currentAge}岁
  • 大运状态：${baziData.luckPillars.currentPillar.yearStart && new Date().getFullYear() < baziData.luckPillars.currentPillar.yearStart ? '即将进入' : baziData.luckPillars.currentPillar.yearEnd && new Date().getFullYear() > baziData.luckPillars.currentPillar.yearEnd ? '已结束' : '进行中'}

  【分析重点】请特别关注当前大运对用户近况的影响，结合当前大运${baziData.luckPillars.currentPillar.heavenlyStem}${baziData.luckPillars.currentPillar.earthlyBranch}的特点，分析过去一年（${currentYear - 1}年${currentMonth}月-${currentYear}年${currentMonth}月）的具体事件和运势变化。
` : ''}

完整大运列表：
${baziData.luckPillars.pillars.map((pillar, index) => {
  const isCurrent = baziData.luckPillars?.currentPillar?.number === pillar.number ? ' ⭐当前' : '';
  return `  ${index + 1}. 第${pillar.number}步大运：${pillar.heavenlyStem}${pillar.earthlyBranch}${isCurrent}
      └─ 起运：${pillar.ageStart}岁 | 年份：${pillar.yearStart || '?'}-${pillar.yearEnd || '?'}年`;
}).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''

    const interactionsInfo = baziData.interactions ? `
【八字相互作用分析（重要影响）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
共发现 ${baziData.interactions.length} 个相互作用，详情如下：

${baziData.interactions.map((interaction, index) => {
  const typeNames: { [key: string]: string } = {
    'Branch6Combo': '六合',
    'Branch3Combo': '三合',
    'BranchClash': '六冲',
    'BranchHarm': '六害',
    'StemClash': '天干冲',
    'TrinityCombo': '三会',
    'DirectionalCombo': '三会局'
  };
  const typeName = typeNames[interaction.type] || interaction.type;
  return `${index + 1}. 【${typeName}】${interaction.type}
     • 相互作用描述：${interaction.description || '无描述'}
     • 参与元素：${interaction.participants.map(p => `${p.pillar}(${p.elementChar}-${p.elementType})`).join('、')}
     • 影响评估：
       - 涉及有利元素：${interaction.involvesFavorableElement ? '✓ 是' : '✗ 否'}
       - 涉及不利元素：${interaction.involvesUnfavorableElement ? '⚠ 是（需注意）' : '✓ 否'}`
}).join('\n\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''

    const wordLimit = '10000字左右'

    return `═══════════════════════════════════════════════════════════
【八字命理分析报告生成任务】
═══════════════════════════════════════════════════════════

请根据以下完整的八字信息，生成一份专业、详细、有指导价值的命理分析报告。

📋 **报告要求**：
  • 字数控制：${wordLimit}
  • 格式要求：使用Markdown格式，结构清晰，层次分明
  • 语言风格：专业、温和、积极、富有同情心和启发性，旨在赋能用户，而不是评判
  • 内容导向：以鼓励和积极引导为主，即使是挑战和困难，也要提供建设性的解决方案和视角

📊 **分析重点（按优先级）**：
  1. 【近况分析】客观、直接、具体、准确，分析过去一年（${currentYear - 1}年${currentMonth}月 - ${currentYear}年${currentMonth}月）的具体事件
  2. 【当前大运分析】结合当前大运，分析运势走向
  3. 【性格分析】深入分析性格优势，并就如何改善劣势提供积极建议
  4. 【事业运势】发掘职业潜能，提供积极发展方向
  5. 【感情婚姻】分析感情模式，并提出积极的经营建议
  6. 【健康养生】分析体质特点和潜在风险，并提供积极的养生建议
  7. 【大运流年】具体时间节点分析
  8. 【综合建议】具体且充满鼓励的行动建议

═══════════════════════════════════════════════════════════
【数据部分开始】
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
【数据部分结束】
═══════════════════════════════════════════════════════════

⚠️  **特别注意事项**：
  ⚡ 近况分析要客观直接：不要用"可能"、"大概"、"也许"等模糊词汇，要基于数据进行分析。
  ⚡ 要具体到事件和时间：例如"2024年3月可能发生工作变动"→"2024年3月发生了工作调动或岗位调整"。
  ⚡ 当前大运是关键：必须结合当前大运${baziData.luckPillars?.currentPillar ? `（${baziData.luckPillars.currentPillar.heavenlyStem}${baziData.luckPillars.currentPillar.earthlyBranch}）` : ''}来分析近况。
  ⚡ 性格分析要以优势为主：深入挖掘用户的天赋和潜力，劣势部分要转化为成长建议。
  ⚡ 感情分析要积极引导：聚焦于提供经营感情的正面建议和策略，避免单纯罗列问题。
  ⚡ 整体基调要赋能：通篇采用鼓励、积极和赋能的语言，帮助用户看到未来的可能性。`
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
