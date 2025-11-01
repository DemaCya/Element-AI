import { NextResponse } from 'next/server'

// 指定使用 Node.js runtime，而不是 Edge runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/payments/test-config
 * 
 * 测试支付配置是否正确
 * 仅在开发环境使用！
 */
export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks: {}
    }

  // 根据模式选择配置（与 paymentService.ts 保持一致）
  const IS_TEST_MODE = process.env.CREEM_MODE === 'test'
  const CREEM_API_BASE_PROD = 'https://api.creem.io/v1'
  const CREEM_API_BASE_TEST = 'https://test-api.creem.io/v1'
  const CREEM_API_BASE = IS_TEST_MODE ? CREEM_API_BASE_TEST : CREEM_API_BASE_PROD
  
  const CREEM_API_KEY = IS_TEST_MODE 
    ? process.env.CREEM_API_KEY_TEST || '' 
    : process.env.CREEM_API_KEY || ''
  const CREEM_PRODUCT_ID = IS_TEST_MODE 
    ? process.env.CREEM_PRODUCT_ID_TEST || '' 
    : process.env.CREEM_PRODUCT_ID || ''
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL

  results.checks.env_vars = {
    CREEM_MODE: IS_TEST_MODE ? 'test' : 'live',
    CREEM_API_KEY: CREEM_API_KEY ? `${CREEM_API_KEY.substring(0, 15)}...` : '❌ NOT SET',
    CREEM_API_KEY_EXISTS: !!CREEM_API_KEY,
    CREEM_API_KEY_FORMAT: CREEM_API_KEY ? 
      (CREEM_API_KEY.startsWith('creem_test_') ? 'TEST' : 
       CREEM_API_KEY.startsWith('creem_live_') ? 'LIVE' : 'INVALID') : 
      'NOT SET',
    CREEM_API_BASE: CREEM_API_BASE,
    CREEM_PRODUCT_ID: CREEM_PRODUCT_ID || '❌ NOT SET',
    CREEM_PRODUCT_ID_FORMAT: CREEM_PRODUCT_ID?.startsWith('prod_') ? 'VALID' : 'INVALID',
    APP_URL: APP_URL || '❌ NOT SET',
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET ✅' : '❌ NOT SET',
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET ✅' : '❌ NOT SET',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET ✅' : '❌ NOT SET',
  }

  // 测试 Creem API 连接
  if (CREEM_API_KEY && CREEM_PRODUCT_ID) {
    try {
      console.log('[Test] Testing Creem API connection...')
      console.log('[Test] Using API base:', CREEM_API_BASE)
      console.log('[Test] Mode:', IS_TEST_MODE ? 'TEST' : 'LIVE')
      
      const response = await fetch(`${CREEM_API_BASE}/checkouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CREEM_API_KEY
        },
        body: JSON.stringify({
          product_id: CREEM_PRODUCT_ID,
          request_id: `test_${Date.now()}`,
          success_url: `${APP_URL || 'http://localhost:3000'}/payment/success`
          // 注意：Creem API 不接受 cancel_url 参数
        })
      })

      const data = await response.json()

      results.checks.creem_api = {
        status: response.ok ? 'SUCCESS ✅' : 'FAILED ❌',
        status_code: response.status,
        response: data
      }

      if (!response.ok) {
        results.checks.creem_api.error_hint = 
          response.status === 401 ? 'API Key 可能不正确或已过期' :
          response.status === 404 ? 'Product ID 可能不存在' :
          response.status === 400 ? '请求参数错误' :
          '未知错误'
      }

    } catch (error: any) {
      results.checks.creem_api = {
        status: 'ERROR ❌',
        error: error.message
      }
    }
  } else {
    results.checks.creem_api = {
      status: 'SKIPPED ⏭️',
      reason: 'Missing API Key or Product ID'
    }
  }

  // 判断总体状态
  const hasApiKey = !!CREEM_API_KEY && CREEM_API_KEY.startsWith('creem_')
  const hasProductId = !!CREEM_PRODUCT_ID && CREEM_PRODUCT_ID.startsWith('prod_')
  const apiWorks = results.checks.creem_api?.status === 'SUCCESS ✅'

  results.overall_status = hasApiKey && hasProductId && apiWorks ? 
    '✅ 配置正确，支付系统可用' : 
    '❌ 配置有问题，请检查上面的详细信息'

  results.suggestions = []

  if (!hasApiKey) {
    results.suggestions.push('请在 .env.local 设置正确的 CREEM_API_KEY 或 CREEM_API_KEY_TEST')
  }

  if (!hasProductId) {
    results.suggestions.push('请在 .env.local 设置正确的 CREEM_PRODUCT_ID')
  }

  if (hasApiKey && hasProductId && !apiWorks) {
    results.suggestions.push('API Key 和 Product ID 已设置，但 Creem API 调用失败')
    results.suggestions.push('请检查上面的 creem_api.error_hint')
  }

  if (results.suggestions.length === 0) {
    results.suggestions.push('配置看起来正确！如果支付仍然失败，请检查:')
    results.suggestions.push('1. 浏览器控制台的具体错误信息')
    results.suggestions.push('2. 服务器日志中的 [Creem] 和 [Payment] 相关日志')
    results.suggestions.push('3. 用户是否已登录')
    results.suggestions.push('4. 报告是否存在且属于当前用户')
  }

    return NextResponse.json(results, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error: any) {
    // 如果整个测试过程出错，返回友好的错误信息
    console.error('[Test Config] Fatal error:', error)
    
    return NextResponse.json({
      error: 'Test configuration failed',
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      suggestion: '请检查 Vercel 环境变量是否正确设置'
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

