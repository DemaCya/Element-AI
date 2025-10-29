#!/usr/bin/env node

/**
 * 生产环境部署检查脚本
 * 检查项目是否准备好部署到Vercel
 */

const checkProductionReadiness = () => {
  console.log('🚀 生产环境部署检查...\n')

  let allChecksPassed = true

  // 检查1: 项目构建
  console.log('1️⃣ 检查项目构建...')
  try {
    const fs = require('fs')
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
    
    if (packageJson.scripts.build) {
      console.log('✅ 构建脚本存在:', packageJson.scripts.build)
    } else {
      console.log('❌ 构建脚本不存在')
      allChecksPassed = false
    }
    
    if (packageJson.scripts.deploy) {
      console.log('✅ 部署脚本存在:', packageJson.scripts.deploy)
    } else {
      console.log('❌ 部署脚本不存在')
      allChecksPassed = false
    }
  } catch (error) {
    console.log('❌ 无法读取package.json:', error.message)
    allChecksPassed = false
  }
  console.log('')

  // 检查2: 环境变量配置
  console.log('2️⃣ 检查环境变量配置...')
  try {
    const fs = require('fs')
    const envExample = fs.readFileSync('./env.example', 'utf8')
    
    const requiredEnvVars = [
      'ZHIPU_API_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'CREEM_API_KEY',
      'CREEM_PRODUCT_ID'
    ]
    
    requiredEnvVars.forEach(envVar => {
      if (envExample.includes(envVar)) {
        console.log(`✅ 环境变量已配置: ${envVar}`)
      } else {
        console.log(`❌ 环境变量缺失: ${envVar}`)
        allChecksPassed = false
      }
    })
  } catch (error) {
    console.log('❌ 无法读取env.example:', error.message)
    allChecksPassed = false
  }
  console.log('')

  // 检查3: API端点功能
  console.log('3️⃣ 检查API端点功能...')
  try {
    const fs = require('fs')
    
    // 检查报告生成API
    if (fs.existsSync('./src/app/api/reports/generate/route.ts')) {
      console.log('✅ 报告生成API存在')
    } else {
      console.log('❌ 报告生成API不存在')
      allChecksPassed = false
    }
    
    // 检查八字计算API
    if (fs.existsSync('./src/app/api/calculate-bazi/route.ts')) {
      console.log('✅ 八字计算API存在')
    } else {
      console.log('❌ 八字计算API不存在')
      allChecksPassed = false
    }
    
    // 检查支付API
    if (fs.existsSync('./src/app/api/payments/create-checkout/route.ts')) {
      console.log('✅ 支付API存在')
    } else {
      console.log('❌ 支付API不存在')
      allChecksPassed = false
    }
  } catch (error) {
    console.log('❌ 无法检查API端点:', error.message)
    allChecksPassed = false
  }
  console.log('')

  // 检查4: 智谱AI集成
  console.log('4️⃣ 检查智谱AI集成...')
  try {
    const fs = require('fs')
    const zhipuService = fs.readFileSync('./src/services/zhipuService.ts', 'utf8')
    
    if (zhipuService.includes('ZhipuAI')) {
      console.log('✅ 智谱AI SDK已集成')
    } else {
      console.log('❌ 智谱AI SDK未集成')
      allChecksPassed = false
    }
    
    if (zhipuService.includes('glm-4.6')) {
      console.log('✅ 使用glm-4.6模型')
    } else {
      console.log('❌ 模型配置不正确')
      allChecksPassed = false
    }
    
    if (zhipuService.includes('近况分析')) {
      console.log('✅ 近况分析功能已集成')
    } else {
      console.log('❌ 近况分析功能未集成')
      allChecksPassed = false
    }
    
    if (zhipuService.includes('当前时间信息')) {
      console.log('✅ 时间信息功能已集成')
    } else {
      console.log('❌ 时间信息功能未集成')
      allChecksPassed = false
    }
  } catch (error) {
    console.log('❌ 无法检查智谱AI集成:', error.message)
    allChecksPassed = false
  }
  console.log('')

  // 检查5: 降级机制
  console.log('5️⃣ 检查降级机制...')
  try {
    const fs = require('fs')
    const generateRoute = fs.readFileSync('./src/app/api/reports/generate/route.ts', 'utf8')
    
    if (generateRoute.includes('falling back to mock reports')) {
      console.log('✅ 降级机制已实现')
    } else {
      console.log('❌ 降级机制未实现')
      allChecksPassed = false
    }
    
    if (generateRoute.includes('ZHIPU_API_KEY not found')) {
      console.log('✅ API密钥检查已实现')
    } else {
      console.log('❌ API密钥检查未实现')
      allChecksPassed = false
    }
  } catch (error) {
    console.log('❌ 无法检查降级机制:', error.message)
    allChecksPassed = false
  }
  console.log('')

  // 检查6: 类型检查
  console.log('6️⃣ 检查类型检查...')
  try {
    const { execSync } = require('child_process')
    execSync('npm run type-check', { stdio: 'pipe' })
    console.log('✅ TypeScript类型检查通过')
  } catch (error) {
    console.log('❌ TypeScript类型检查失败')
    allChecksPassed = false
  }
  console.log('')

  // 总结
  console.log('📋 生产环境部署检查总结:')
  if (allChecksPassed) {
    console.log('🎉 所有检查通过！项目已准备好部署到Vercel')
    console.log('')
    console.log('🚀 部署步骤:')
    console.log('1. 在Vercel中设置环境变量:')
    console.log('   - ZHIPU_API_KEY (必需)')
    console.log('   - NEXT_PUBLIC_SUPABASE_URL (必需)')
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY (必需)')
    console.log('   - SUPABASE_SERVICE_ROLE_KEY (必需)')
    console.log('   - CREEM_API_KEY (支付功能)')
    console.log('   - CREEM_PRODUCT_ID (支付功能)')
    console.log('')
    console.log('2. 部署命令:')
    console.log('   npm run deploy')
    console.log('')
    console.log('3. 部署后功能:')
    console.log('   ✅ 用户点击生成报告 → 调用API → 返回智谱AI生成的报告')
    console.log('   ✅ 如果智谱AI不可用 → 自动降级到模拟报告')
    console.log('   ✅ 支持支付功能 → 解锁完整报告')
    console.log('   ✅ 近况分析 → 基于当前时间分析前一年事件')
  } else {
    console.log('❌ 部分检查未通过，请修复后再部署')
  }
}

// 运行检查
if (require.main === module) {
  checkProductionReadiness()
}

module.exports = { checkProductionReadiness }
