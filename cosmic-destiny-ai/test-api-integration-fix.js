#!/usr/bin/env node

/**
 * 测试API集成修复
 * 验证前端是否正确调用API
 */

console.log('🔧 测试API集成修复')
console.log('='.repeat(50))

// 检查前端代码修改
const fs = require('fs')
const path = require('path')

const generatePagePath = path.join(__dirname, 'src/app/generate/page.tsx')
const generatePageContent = fs.readFileSync(generatePagePath, 'utf8')

console.log('📄 检查前端代码修改...')

// 检查是否包含API调用
const hasApiCall = generatePageContent.includes('fetch(\'/api/reports/generate\'')
const hasApiLogging = generatePageContent.includes('🤖 [Generate] Calling API to generate AI reports...')
const hasApiResponse = generatePageContent.includes('apiResult = await response.json()')

console.log('✅ API调用代码:', hasApiCall ? '✅ 已添加' : '❌ 缺失')
console.log('✅ API日志代码:', hasApiLogging ? '✅ 已添加' : '❌ 缺失')
console.log('✅ API响应处理:', hasApiResponse ? '✅ 已添加' : '❌ 缺失')

// 检查是否移除了模拟报告生成
const hasMockGeneration = generatePageContent.includes('generateFullReport(birthData, baziData)')
const hasPreviewGeneration = generatePageContent.includes('generatePreviewReport(birthData, baziData)')

console.log('❌ 模拟报告生成:', hasMockGeneration ? '❌ 仍然存在' : '✅ 已移除')
console.log('❌ 预览报告生成:', hasPreviewGeneration ? '❌ 仍然存在' : '✅ 已移除')

console.log('\n📋 修复总结:')
console.log('='.repeat(30))

if (hasApiCall && hasApiLogging && hasApiResponse && !hasMockGeneration && !hasPreviewGeneration) {
  console.log('🎉 修复完成！')
  console.log('✅ 前端现在会调用API生成报告')
  console.log('✅ 添加了详细的API调用日志')
  console.log('✅ 移除了模拟报告生成代码')
  console.log('\n🚀 下一步:')
  console.log('1. 重新部署到Vercel')
  console.log('2. 测试报告生成功能')
  console.log('3. 检查Vercel日志中的API调用')
} else {
  console.log('⚠️ 修复不完整，需要进一步检查')
}

console.log('\n🔍 验证步骤:')
console.log('1. 访问Vercel部署的网站')
console.log('2. 填写出生信息表单')
console.log('3. 点击生成报告')
console.log('4. 检查浏览器控制台日志')
console.log('5. 检查Vercel函数日志')

console.log('\n📊 预期日志输出:')
console.log('🤖 [Generate] Calling API to generate AI reports...')
console.log('✅ [Generate] API response received: {...}')
console.log('🚀 [API] Starting report generation with birthData: {...}')
console.log('🔑 [API] Environment variables check:')
console.log('🤖 [API] Generating AI report with ZhipuAI...')
console.log('✅ [API] Full AI report generated, length: XXXX')
