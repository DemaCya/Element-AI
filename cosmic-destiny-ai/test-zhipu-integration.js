#!/usr/bin/env node

/**
 * 智谱AI集成测试脚本
 * 用于验证智谱AI服务是否正常工作
 */

const testZhipuIntegration = async () => {
  console.log('🧪 开始测试智谱AI集成...\n')

  // 测试1: 检查环境变量
  console.log('1️⃣ 检查环境变量...')
  if (!process.env.ZHIPU_API_KEY) {
    console.log('❌ ZHIPU_API_KEY 未设置')
    console.log('请设置环境变量: export ZHIPU_API_KEY=your_api_key')
    return
  }
  console.log('✅ ZHIPU_API_KEY 已设置\n')

  // 测试2: 测试API连接
  console.log('2️⃣ 测试API连接...')
  try {
    const response = await fetch('http://localhost:3000/api/test-zhipu', {
      method: 'GET'
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ API连接测试成功')
      console.log(`📝 响应: ${result.message}`)
    } else {
      console.log('❌ API连接测试失败')
      console.log(`📝 错误: ${result.message}`)
    }
  } catch (error) {
    console.log('❌ API连接测试失败')
    console.log(`📝 错误: ${error.message}`)
  }
  console.log('')

  // 测试3: 测试内容生成
  console.log('3️⃣ 测试内容生成...')
  try {
    const response = await fetch('http://localhost:3000/api/test-zhipu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        testPrompt: '请用一句话介绍中国传统八字命理学。'
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ 内容生成测试成功')
      console.log(`📝 AI回复: ${result.response}`)
    } else {
      console.log('❌ 内容生成测试失败')
      console.log(`📝 错误: ${result.message}`)
    }
  } catch (error) {
    console.log('❌ 内容生成测试失败')
    console.log(`📝 错误: ${error.message}`)
  }
  console.log('')

  // 测试4: 测试报告生成
  console.log('4️⃣ 测试报告生成...')
  try {
    const testBirthData = {
      birthDate: '1990-01-01',
      birthTime: '12:00',
      timeZone: 'Asia/Shanghai',
      gender: 'male',
      isTimeKnownInput: true
    }

    const response = await fetch('http://localhost:3000/api/reports/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        birthData: testBirthData,
        reportName: '测试报告'
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ 报告生成测试成功')
      console.log(`📝 报告ID: ${result.reportId}`)
      console.log(`📝 数据源: ${result.source}`)
      console.log(`📝 预览报告长度: ${result.previewReport?.length || 0} 字符`)
      console.log(`📝 完整报告长度: ${result.fullReport?.length || 0} 字符`)
    } else {
      console.log('❌ 报告生成测试失败')
      console.log(`📝 错误: ${result.message}`)
    }
  } catch (error) {
    console.log('❌ 报告生成测试失败')
    console.log(`📝 错误: ${error.message}`)
  }

  console.log('\n🎉 测试完成！')
}

// 运行测试
if (require.main === module) {
  testZhipuIntegration().catch(console.error)
}

module.exports = { testZhipuIntegration }
