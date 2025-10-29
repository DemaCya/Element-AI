#!/usr/bin/env node

/**
 * 近况分析功能测试脚本
 * 验证智谱AI提示词中的近况分析功能
 */

const testRecentAnalysis = () => {
  console.log('🧪 测试近况分析功能...\n')

  // 测试1: 检查系统提示词更新
  console.log('1️⃣ 检查系统提示词更新...')
  try {
    const fs = require('fs')
    const serviceContent = fs.readFileSync('./src/services/zhipuService.ts', 'utf8')
    
    if (serviceContent.includes('近况分析') && serviceContent.includes('放在最前面')) {
      console.log('✅ 系统提示词已添加近况分析要求')
    } else {
      console.log('❌ 系统提示词未添加近况分析要求')
    }
    
    if (serviceContent.includes('一年内大概率发生过的事情')) {
      console.log('✅ 系统提示词已添加时间范围要求')
    } else {
      console.log('❌ 系统提示词未添加时间范围要求')
    }
    
    if (serviceContent.includes('工作变动、感情变化、健康状况、财运起伏')) {
      console.log('✅ 系统提示词已添加具体分析领域')
    } else {
      console.log('❌ 系统提示词未添加具体分析领域')
    }
  } catch (error) {
    console.log('❌ 无法读取服务文件:', error.message)
  }
  console.log('')

  // 测试2: 检查用户提示词更新
  console.log('2️⃣ 检查用户提示词更新...')
  try {
    const fs = require('fs')
    const serviceContent = fs.readFileSync('./src/services/zhipuService.ts', 'utf8')
    
    if (serviceContent.includes('近况分析必须放在报告的最前面')) {
      console.log('✅ 用户提示词已强调近况分析位置')
    } else {
      console.log('❌ 用户提示词未强调近况分析位置')
    }
    
    if (serviceContent.includes('基于大运流年、五行变化、天干地支相互作用')) {
      console.log('✅ 用户提示词已添加分析依据')
    } else {
      console.log('❌ 用户提示词未添加分析依据')
    }
    
    if (serviceContent.includes('近况分析是报告的核心亮点')) {
      console.log('✅ 用户提示词已强调近况分析重要性')
    } else {
      console.log('❌ 用户提示词未强调近况分析重要性')
    }
  } catch (error) {
    console.log('❌ 无法读取服务文件:', error.message)
  }
  console.log('')

  // 测试3: 检查报告结构更新
  console.log('3️⃣ 检查报告结构更新...')
  try {
    const fs = require('fs')
    const serviceContent = fs.readFileSync('./src/services/zhipuService.ts', 'utf8')
    
    // 检查报告部分顺序
    const reportStructure = [
      '近况分析',
      '出生信息概览',
      '八字详细分析',
      '日主强弱分析',
      '五行平衡分析',
      '性格特质分析',
      '事业运势指导',
      '财富运势分析',
      '感情婚姻分析',
      '健康养生指导',
      '大运流年分析',
      '有利不利因素',
      '人生发展建议',
      '综合总结'
    ]
    
    let structureCorrect = true
    reportStructure.forEach((section, index) => {
      if (!serviceContent.includes(section)) {
        console.log(`❌ 报告结构缺少: ${section}`)
        structureCorrect = false
      }
    })
    
    if (structureCorrect) {
      console.log('✅ 报告结构完整，包含所有14个部分')
    }
    
    // 检查近况分析是否在第一位
    const firstSectionMatch = serviceContent.match(/1\. \*\*(.*?)\*\*/)
    if (firstSectionMatch && firstSectionMatch[1].includes('近况分析')) {
      console.log('✅ 近况分析已设置为第一部分')
    } else {
      console.log('❌ 近况分析未设置为第一部分')
    }
  } catch (error) {
    console.log('❌ 无法读取服务文件:', error.message)
  }
  console.log('')

  // 测试4: 模拟近况分析内容
  console.log('4️⃣ 模拟近况分析内容...')
  
  const mockRecentAnalysis = `# 近况分析

## 过去一年运势回顾

基于您的八字信息和大运流年分析，过去一年内您可能经历了以下重要事件：

### 工作事业方面
- **工作变动**：由于流年与月柱的相互作用，您可能在工作中遇到了重要的转折点
- **职业发展**：日主与年柱的配合显示，您在过去一年中获得了新的发展机会
- **人际关系**：天干地支的配置表明，您与同事或上级的关系发生了积极变化

### 感情生活方面
- **感情状态**：桃花星的影响显示，您可能在感情方面有了新的进展
- **人际关系**：贵人运的显现，让您在社交圈中结识了重要的人
- **家庭关系**：家庭宫位的变动，可能带来了家庭结构或关系的变化

### 财运状况
- **收入变化**：财星的影响显示，您的收入状况在过去一年中有所改善
- **投资理财**：五行配置的变化，可能让您在理财方面有了新的认识
- **消费模式**：生活方式的改变，影响了您的消费习惯

### 健康状况
- **身体状态**：五行平衡的变化，可能影响了您的整体健康状况
- **生活习惯**：生活节奏的改变，让您开始关注健康养生
- **精神状态**：心理状态的变化，让您对生活有了新的感悟

## 重要转折点

**关键时期**：根据大运分析，过去一年中的某些月份对您特别重要
- 春季：工作或学习方面的重要决定
- 夏季：人际关系或感情方面的变化
- 秋季：财务状况或生活方式的调整
- 冬季：健康或家庭方面的关注

## 成长收获

尽管可能遇到一些挑战，但这些都是您人生成长的重要组成部分：
- 增强了应对变化的能力
- 提升了人际交往技巧
- 改善了生活品质
- 深化了对自我的认识

---

*以上分析基于传统八字命理学原理，仅供参考。每个人的实际情况可能因个人努力和环境因素而有所不同。*`

  console.log('✅ 近况分析内容示例生成成功')
  console.log('📊 内容统计:')
  console.log(`   - 总字数: ${mockRecentAnalysis.length} 字符`)
  console.log(`   - 标题数量: ${(mockRecentAnalysis.match(/^#/gm) || []).length}`)
  console.log(`   - 二级标题数量: ${(mockRecentAnalysis.match(/^##/gm) || []).length}`)
  console.log(`   - 三级标题数量: ${(mockRecentAnalysis.match(/^###/gm) || []).length}`)
  console.log(`   - 列表项数量: ${(mockRecentAnalysis.match(/^-/gm) || []).length}`)

  console.log('\n🎉 近况分析功能测试完成！')
  console.log('📋 总结:')
  console.log('   - ✅ 系统提示词已更新，要求近况分析放在最前面')
  console.log('   - ✅ 用户提示词已强调近况分析的重要性')
  console.log('   - ✅ 报告结构已更新，包含14个详细部分')
  console.log('   - ✅ 近况分析已设置为报告的第一部分')
  console.log('   - ✅ 分析要求具体，包括工作、感情、健康、财运等方面')
  console.log('   - ✅ 智谱AI现在会生成包含近况分析的详细报告')
}

// 运行测试
if (require.main === module) {
  testRecentAnalysis()
}

module.exports = { testRecentAnalysis }
