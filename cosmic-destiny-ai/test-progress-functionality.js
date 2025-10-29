#!/usr/bin/env node

/**
 * 测试进度跟踪功能
 * 这个脚本模拟AI报告生成过程，测试进度API是否正常工作
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function testProgressAPI() {
  console.log('🧪 [Test] Starting progress API test...')
  
  const sessionId = `test-session-${Date.now()}`
  
  try {
    // 测试1: 设置初始进度
    console.log('📊 [Test] Setting initial progress...')
    const setResponse = await fetch(`${BASE_URL}/api/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        progress: 10,
        status: 'preparing',
        message: '正在准备AI分析数据...'
      })
    })
    
    if (!setResponse.ok) {
      throw new Error(`Failed to set progress: ${setResponse.status}`)
    }
    
    const setData = await setResponse.json()
    console.log('✅ [Test] Progress set successfully:', setData)
    
    // 测试2: 获取进度
    console.log('📊 [Test] Getting progress...')
    const getResponse = await fetch(`${BASE_URL}/api/progress?sessionId=${sessionId}`)
    
    if (!getResponse.ok) {
      throw new Error(`Failed to get progress: ${getResponse.status}`)
    }
    
    const getData = await getResponse.json()
    console.log('✅ [Test] Progress retrieved successfully:', getData)
    
    // 测试3: 模拟进度更新
    const progressSteps = [
      { progress: 20, status: 'analyzing', message: '正在分析八字信息...' },
      { progress: 30, status: 'generating', message: '正在调用AI生成报告...' },
      { progress: 50, status: 'generating', message: 'AI正在生成报告内容...' },
      { progress: 80, status: 'processing', message: '正在处理AI响应...' },
      { progress: 100, status: 'completed', message: 'AI报告生成完成！' }
    ]
    
    for (const step of progressSteps) {
      console.log(`📊 [Test] Updating progress to ${step.progress}%...`)
      
      const updateResponse = await fetch(`${BASE_URL}/api/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          ...step
        })
      })
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update progress: ${updateResponse.status}`)
      }
      
      // 验证更新
      const verifyResponse = await fetch(`${BASE_URL}/api/progress?sessionId=${sessionId}`)
      const verifyData = await verifyResponse.json()
      
      if (verifyData.progress !== step.progress) {
        throw new Error(`Progress mismatch: expected ${step.progress}, got ${verifyData.progress}`)
      }
      
      console.log(`✅ [Test] Progress updated to ${step.progress}%: ${step.message}`)
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // 测试4: 删除进度
    console.log('🗑️ [Test] Deleting progress...')
    const deleteResponse = await fetch(`${BASE_URL}/api/progress?sessionId=${sessionId}`, {
      method: 'DELETE'
    })
    
    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete progress: ${deleteResponse.status}`)
    }
    
    const deleteData = await deleteResponse.json()
    console.log('✅ [Test] Progress deleted successfully:', deleteData)
    
    // 测试5: 验证删除
    console.log('🔍 [Test] Verifying deletion...')
    const verifyDeleteResponse = await fetch(`${BASE_URL}/api/progress?sessionId=${sessionId}`)
    
    if (verifyDeleteResponse.ok) {
      throw new Error('Progress should not exist after deletion')
    }
    
    console.log('✅ [Test] Deletion verified - progress not found as expected')
    
    console.log('🎉 [Test] All progress API tests passed!')
    
  } catch (error) {
    console.error('❌ [Test] Progress API test failed:', error)
    process.exit(1)
  }
}

async function testReportGenerationWithProgress() {
  console.log('🧪 [Test] Starting report generation with progress test...')
  
  const sessionId = `test-report-${Date.now()}`
  const testBirthData = {
    birthDate: '1990-01-01',
    birthTime: '12:00',
    timeZone: 'Asia/Shanghai',
    gender: 'male',
    isTimeKnownInput: true,
    reportName: 'Test Report'
  }
  
  try {
    console.log('📊 [Test] Starting report generation...')
    
    // 启动报告生成（异步）
    const reportPromise = fetch(`${BASE_URL}/api/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthData: testBirthData,
        reportName: 'Test Report',
        sessionId
      })
    })
    
    // 轮询进度
    let progressComplete = false
    const progressInterval = setInterval(async () => {
      try {
        const progressResponse = await fetch(`${BASE_URL}/api/progress?sessionId=${sessionId}`)
        if (progressResponse.ok) {
          const progressData = await progressResponse.json()
          console.log(`📊 [Test] Progress: ${progressData.progress}% - ${progressData.message}`)
          
          if (progressData.status === 'completed' || progressData.status === 'error') {
            progressComplete = true
            clearInterval(progressInterval)
          }
        }
      } catch (error) {
        console.warn('⚠️ [Test] Failed to poll progress:', error)
      }
    }, 2000)
    
    // 等待报告生成完成
    const reportResponse = await reportPromise
    
    if (!reportResponse.ok) {
      throw new Error(`Report generation failed: ${reportResponse.status}`)
    }
    
    const reportData = await reportResponse.json()
    console.log('✅ [Test] Report generated successfully:', {
      success: reportData.success,
      reportId: reportData.reportId,
      source: reportData.source
    })
    
    // 等待进度轮询完成
    await new Promise(resolve => {
      const checkComplete = () => {
        if (progressComplete) {
          resolve(undefined)
        } else {
          setTimeout(checkComplete, 100)
        }
      }
      checkComplete()
    })
    
    console.log('🎉 [Test] Report generation with progress test completed!')
    
  } catch (error) {
    console.error('❌ [Test] Report generation test failed:', error)
    process.exit(1)
  }
}

async function main() {
  console.log('🚀 [Test] Starting progress functionality tests...')
  console.log(`🌐 [Test] Testing against: ${BASE_URL}`)
  
  try {
    await testProgressAPI()
    console.log('')
    await testReportGenerationWithProgress()
    
    console.log('')
    console.log('🎉 [Test] All tests completed successfully!')
    console.log('')
    console.log('📋 [Test] Test Summary:')
    console.log('  ✅ Progress API CRUD operations')
    console.log('  ✅ Progress tracking during report generation')
    console.log('  ✅ Real-time progress updates')
    console.log('  ✅ Progress cleanup')
    
  } catch (error) {
    console.error('❌ [Test] Test suite failed:', error)
    process.exit(1)
  }
}

// 运行测试
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  testProgressAPI,
  testReportGenerationWithProgress
}
