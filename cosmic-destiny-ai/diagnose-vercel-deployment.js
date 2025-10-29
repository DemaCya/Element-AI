#!/usr/bin/env node

/**
 * Vercel部署问题诊断脚本
 * 检查为什么返回模拟报告而不是智谱AI报告
 */

const diagnoseVercelDeployment = () => {
  console.log('🔍 Vercel部署问题诊断...\n')

  console.log('📋 可能的原因分析:')
  console.log('')
  
  console.log('1️⃣ **环境变量未设置** (最常见)')
  console.log('   - ZHIPU_API_KEY 未在Vercel中设置')
  console.log('   - 检查方法: 在Vercel Dashboard → Settings → Environment Variables')
  console.log('')
  
  console.log('2️⃣ **环境变量名称错误**')
  console.log('   - 确保变量名完全匹配: ZHIPU_API_KEY')
  console.log('   - 注意大小写和拼写')
  console.log('')
  
  console.log('3️⃣ **环境变量作用域问题**')
  console.log('   - 确保环境变量设置为 Production 环境')
  console.log('   - 或者设置为 All Environments')
  console.log('')
  
  console.log('4️⃣ **API密钥无效**')
  console.log('   - 智谱AI API密钥可能已过期或无效')
  console.log('   - 需要重新生成API密钥')
  console.log('')
  
  console.log('5️⃣ **部署缓存问题**')
  console.log('   - Vercel可能使用了缓存的构建')
  console.log('   - 需要重新部署')
  console.log('')

  console.log('🛠️ 解决步骤:')
  console.log('')
  
  console.log('步骤1: 检查Vercel环境变量')
  console.log('1. 登录 Vercel Dashboard')
  console.log('2. 选择你的项目')
  console.log('3. 点击 Settings 标签')
  console.log('4. 点击 Environment Variables')
  console.log('5. 检查是否有 ZHIPU_API_KEY')
  console.log('')
  
  console.log('步骤2: 设置环境变量')
  console.log('1. 点击 Add New')
  console.log('2. Name: ZHIPU_API_KEY')
  console.log('3. Value: 你的智谱AI API密钥')
  console.log('4. Environment: Production (或 All)')
  console.log('5. 点击 Save')
  console.log('')
  
  console.log('步骤3: 重新部署')
  console.log('1. 在Vercel Dashboard中点击 Deployments')
  console.log('2. 点击最新的部署')
  console.log('3. 点击 Redeploy')
  console.log('或者推送新代码触发重新部署')
  console.log('')

  console.log('🧪 测试方法:')
  console.log('')
  
  console.log('方法1: 检查API响应')
  console.log('1. 打开浏览器开发者工具')
  console.log('2. 生成报告')
  console.log('3. 查看Network标签中的API响应')
  console.log('4. 检查返回的JSON中source字段')
  console.log('   - source: "zhipu-ai" → 使用智谱AI')
  console.log('   - source: "mock" → 使用模拟报告')
  console.log('')
  
  console.log('方法2: 检查Vercel日志')
  console.log('1. 在Vercel Dashboard中点击 Functions')
  console.log('2. 查看API调用的日志')
  console.log('3. 查找 "ZHIPU_API_KEY not found" 或类似错误')
  console.log('')

  console.log('🔧 调试代码:')
  console.log('')
  
  console.log('在API中添加调试日志:')
  console.log('```typescript')
  console.log('// 在 /api/reports/generate/route.ts 中添加')
  console.log('console.log("🔑 ZHIPU_API_KEY exists:", !!process.env.ZHIPU_API_KEY)')
  console.log('console.log("🔑 ZHIPU_API_KEY length:", process.env.ZHIPU_API_KEY?.length || 0)')
  console.log('console.log("🔑 ZHIPU_API_KEY prefix:", process.env.ZHIPU_API_KEY?.substring(0, 10) || "undefined")')
  console.log('```')
  console.log('')

  console.log('📞 获取智谱AI API密钥:')
  console.log('')
  console.log('1. 访问 https://bigmodel.cn/')
  console.log('2. 注册/登录账号')
  console.log('3. 进入 API Keys 页面')
  console.log('4. 创建新的API密钥')
  console.log('5. 复制API密钥到Vercel环境变量')
  console.log('')

  console.log('🎯 快速验证:')
  console.log('')
  console.log('1. 设置环境变量后，等待1-2分钟')
  console.log('2. 重新生成报告')
  console.log('3. 检查报告内容是否更详细（8000字左右）')
  console.log('4. 检查报告开头是否有"近况分析"部分')
  console.log('')

  console.log('💡 常见问题:')
  console.log('')
  console.log('Q: 设置了环境变量还是模拟报告？')
  console.log('A: 需要重新部署，环境变量不会立即生效')
  console.log('')
  console.log('Q: API密钥格式是什么？')
  console.log('A: 通常是类似 "sk-xxxxxxxxxxxxxxxx" 的格式')
  console.log('')
  console.log('Q: 如何确认环境变量已设置？')
  console.log('A: 在Vercel Dashboard的Environment Variables页面查看')
  console.log('')

  console.log('🚀 如果以上步骤都完成了，但仍然返回模拟报告，请检查:')
  console.log('1. 智谱AI API密钥是否有效')
  console.log('2. 智谱AI服务是否正常')
  console.log('3. 网络连接是否正常')
  console.log('4. Vercel函数日志中的具体错误信息')
}

// 运行诊断
if (require.main === module) {
  diagnoseVercelDeployment()
}

module.exports = { diagnoseVercelDeployment }
