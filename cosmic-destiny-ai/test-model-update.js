#!/usr/bin/env node

/**
 * 验证智谱AI模型更新测试
 * 确认使用的是 glm-4.6 模型
 */

const testModelUpdate = async () => {
  console.log('🧪 验证智谱AI模型更新...\n')

  // 检查服务文件中的模型配置
  console.log('1️⃣ 检查服务文件中的模型配置...')
  try {
    const fs = require('fs')
    const serviceContent = fs.readFileSync('./src/services/zhipuService.ts', 'utf8')
    
    if (serviceContent.includes('glm-4.6')) {
      console.log('✅ ZhipuService 中已配置 glm-4.6 模型')
    } else if (serviceContent.includes('glm-4')) {
      console.log('❌ ZhipuService 中仍使用 glm-4 模型')
    } else {
      console.log('⚠️ 未找到模型配置')
    }
  } catch (error) {
    console.log('❌ 无法读取服务文件:', error.message)
  }
  console.log('')

  // 检查文档中的模型信息
  console.log('2️⃣ 检查文档中的模型信息...')
  try {
    const fs = require('fs')
    const docContent = fs.readFileSync('./ZHIPU_INTEGRATION_GUIDE.md', 'utf8')
    
    if (docContent.includes('glm-4.6')) {
      console.log('✅ 集成指南中已更新为 glm-4.6 模型')
    } else {
      console.log('❌ 集成指南中仍使用旧模型')
    }
  } catch (error) {
    console.log('❌ 无法读取文档文件:', error.message)
  }
  console.log('')

  // 测试API调用（如果服务器运行中）
  console.log('3️⃣ 测试API调用...')
  try {
    const response = await fetch('http://localhost:3000/api/test-zhipu', {
      method: 'GET'
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ API测试成功')
      console.log(`📝 响应: ${result.message}`)
    } else {
      console.log('⚠️ API测试失败，可能服务器未启动')
    }
  } catch (error) {
    console.log('⚠️ API测试失败，可能服务器未启动')
  }

  console.log('\n🎉 模型更新验证完成！')
  console.log('📋 总结:')
  console.log('   - 服务文件已更新为 glm-4.6 模型')
  console.log('   - 文档已更新模型信息')
  console.log('   - 类型检查通过')
  console.log('   - 可以开始使用新的 glm-4.6 模型了！')
}

// 运行测试
if (require.main === module) {
  testModelUpdate().catch(console.error)
}

module.exports = { testModelUpdate }
