#!/usr/bin/env node

/**
 * 智谱AI提示词结构演示
 * 展示系统提示词和用户提示词的区别
 */

const demonstratePromptStructure = () => {
  console.log('🧪 智谱AI提示词结构演示...\n')

  // 系统提示词（固定）
  const systemPrompt = `你是一位资深的命理师和人生指导师，精通中国传统八字命理学。你需要根据用户提供的完整八字信息，生成一份专业、详细、全面的命理分析报告。

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

  // 用户提示词（动态）
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentDay = now.getDate()
  const currentDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`

  const userPrompt = `请根据以下完整的八字信息和当前时间，生成一份详细的命理分析报告，字数控制在8000字左右：

【当前时间信息】
- 当前日期：${currentDate}
- 当前年份：${currentYear}年
- 当前月份：${currentMonth}月
- 当前日期：${currentDay}日
- 分析时间范围：${currentYear - 1}年${currentMonth}月${currentDay}日 至 ${currentDate}

【出生信息】
- 出生日期：1990-01-01
- 出生时间：12:00 (用户提供)
- 性别：男
- 时区：Asia/Shanghai

【八字基础信息】
- 年柱：甲子
- 月柱：乙丑
- 日柱：丙寅
- 时柱：丁卯

【天干地支】
- 天干：甲、乙、丙、丁
- 地支：子、丑、寅、卯
- 藏干：癸、己、甲、乙

【日主信息】
- 日主：丙
- 阴阳：Yang
- 五行：FIRE

【五行分布】
- 木：2
- 火：1
- 土：1
- 金：1
- 水：1

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

  console.log('📋 系统提示词（固定）:')
  console.log('角色: system')
  console.log('长度:', systemPrompt.length, '字符')
  console.log('内容预览:', systemPrompt.substring(0, 100) + '...')
  console.log('')

  console.log('📋 用户提示词（动态）:')
  console.log('角色: user')
  console.log('长度:', userPrompt.length, '字符')
  console.log('内容预览:', userPrompt.substring(0, 100) + '...')
  console.log('')

  console.log('🔄 实际API调用结构:')
  console.log(JSON.stringify({
    model: 'glm-4.6',
    messages: [
      {
        role: 'system',
        content: '[系统提示词 - 定义AI身份和行为规则]'
      },
      {
        role: 'user',
        content: '[用户提示词 - 包含具体数据和请求]'
      }
    ],
    temperature: 0.7,
    max_tokens: 8000,
    stream: false
  }, null, 2))

  console.log('\n🎯 为什么要分离？')
  console.log('1. **API要求**: 智谱AI需要system和user两个不同角色的消息')
  console.log('2. **职责分离**: 系统提示词定义AI身份，用户提示词包含具体数据')
  console.log('3. **维护性**: 系统提示词相对固定，用户提示词需要动态生成')
  console.log('4. **可读性**: 分离后代码更清晰，易于维护和修改')
  console.log('5. **复用性**: 系统提示词可以在多个场景中复用')

  console.log('\n📊 数据流总结:')
  console.log('用户数据 → buildPrompt() → 用户提示词 → API调用')
  console.log('固定规则 → getSystemPrompt() → 系统提示词 → API调用')
  console.log('API调用 → 智谱AI → 生成报告 → 返回给用户')
}

// 运行演示
if (require.main === module) {
  demonstratePromptStructure()
}

module.exports = { demonstratePromptStructure }
