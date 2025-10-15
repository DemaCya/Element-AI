// 支付配置测试脚本
// 运行: node test-payment-config.js

// 加载环境变量
require('dotenv').config({ path: '.env.local' })

console.log('=== 🔍 Creem 配置检查 ===\n')

const checks = [
  { name: 'CREEM_API_KEY', value: process.env.CREEM_API_KEY, required: false },
  { name: 'CREEM_API_KEY_TEST', value: process.env.CREEM_API_KEY_TEST, required: false },
  { name: 'CREEM_PRODUCT_ID', value: process.env.CREEM_PRODUCT_ID, required: true },
  { name: 'CREEM_MODE', value: process.env.CREEM_MODE, required: false },
  { name: 'NEXT_PUBLIC_APP_URL', value: process.env.NEXT_PUBLIC_APP_URL, required: true },
]

let hasIssues = false

console.log('📋 环境变量检查:\n')

checks.forEach(check => {
  const hasValue = check.value && check.value.length > 0 && !check.value.includes('your_')
  const status = hasValue ? '✅' : '❌'
  
  const displayValue = check.value ? 
    (check.value.length > 40 ? check.value.substring(0, 40) + '...' : check.value) : 
    'NOT SET'
  
  console.log(`${status} ${check.name}`)
  console.log(`   值: ${displayValue}`)
  
  if (!hasValue && check.required) {
    hasIssues = true
    console.log(`   ⚠️  这是必需的配置项！请在 .env.local 中设置\n`)
  } else if (!hasValue) {
    console.log(`   ℹ️  未设置（可选）\n`)
  } else {
    console.log('') // 空行
  }
})

// 检查使用的 API Key
console.log('🔑 API Key 检查:\n')

const apiKey = process.env.CREEM_API_KEY || process.env.CREEM_API_KEY_TEST

if (apiKey) {
  const isTest = apiKey.startsWith('creem_test_')
  const isLive = apiKey.startsWith('creem_live_')
  const mode = process.env.CREEM_MODE || 'not set'
  
  if (isTest) {
    console.log('✅ 使用 TEST 模式 API key')
    console.log(`   Key 长度: ${apiKey.length} 字符`)
    console.log(`   CREEM_MODE: ${mode}`)
  } else if (isLive) {
    console.log('⚠️  使用 LIVE 模式 API key (确保这是你想要的)')
    console.log(`   Key 长度: ${apiKey.length} 字符`)
    console.log(`   CREEM_MODE: ${mode}`)
  } else {
    console.log('❌ API key 格式错误')
    console.log(`   应该以 'creem_test_' 或 'creem_live_' 开头`)
    console.log(`   当前值: ${apiKey.substring(0, 20)}...`)
    hasIssues = true
  }
} else {
  console.log('❌ 没有找到 API key')
  console.log('   需要设置 CREEM_API_KEY 或 CREEM_API_KEY_TEST')
  hasIssues = true
}

// 检查 Product ID
console.log('\n📦 Product ID 检查:\n')

const productId = process.env.CREEM_PRODUCT_ID

if (productId) {
  const isValid = productId.startsWith('prod_')
  
  if (isValid) {
    console.log('✅ Product ID 格式正确')
    console.log(`   ID: ${productId}`)
  } else {
    console.log('❌ Product ID 格式错误')
    console.log(`   应该以 'prod_' 开头`)
    console.log(`   当前值: ${productId}`)
    hasIssues = true
  }
} else {
  console.log('❌ Product ID 未设置')
  hasIssues = true
}

// 检查 Supabase 配置
console.log('\n🗄️  Supabase 配置检查:\n')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase 客户端配置正确')
} else {
  console.log('❌ Supabase 客户端配置缺失')
  hasIssues = true
}

if (supabaseServiceKey) {
  console.log('✅ Supabase Service Role Key 已设置 (Webhook 需要)')
} else {
  console.log('⚠️  Supabase Service Role Key 未设置 (Webhook 可能无法工作)')
}

// 测试 Creem API 连接
console.log('\n🌐 测试 Creem API 连接:\n')

if (apiKey && productId && apiKey.startsWith('creem_')) {
  const testCreemAPI = async () => {
    try {
      console.log('正在测试连接到 Creem API...')
      
      const response = await fetch('https://api.creem.io/v1/checkouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          product_id: productId,
          request_id: 'test_' + Date.now(),
          success_url: 'http://localhost:3000/payment/success',
          cancel_url: 'http://localhost:3000/payment/cancel'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ Creem API 连接成功！')
        console.log(`   Checkout ID: ${data.checkout_id}`)
        console.log(`   Checkout URL: ${data.checkout_url}`)
        console.log('\n⚠️  这是一个真实的测试支付链接！')
      } else {
        console.log('❌ Creem API 返回错误')
        console.log(`   状态码: ${response.status}`)
        console.log(`   错误信息:`, data)
        hasIssues = true
        
        if (response.status === 401) {
          console.log('\n💡 提示: API Key 可能不正确或已过期')
          console.log('   请到 https://creem.io/dashboard/developers 重新复制')
        } else if (response.status === 404) {
          console.log('\n💡 提示: Product ID 可能不存在')
          console.log('   请到 https://creem.io/dashboard/products 确认产品')
        }
      }
      
    } catch (error) {
      console.log('❌ 无法连接到 Creem API')
      console.log(`   错误: ${error.message}`)
      hasIssues = true
    }
  }
  
  testCreemAPI().then(() => {
    console.log('\n' + '='.repeat(50))
    console.log('\n📊 总结:\n')
    
    if (hasIssues) {
      console.log('❌ 配置存在问题，请根据上面的提示修复')
      console.log('\n常见解决方案:')
      console.log('1. 重新从 Creem Dashboard 复制 API Key 和 Product ID')
      console.log('2. 确保 .env.local 文件在项目根目录')
      console.log('3. 重启开发服务器: Ctrl+C 然后 npm run dev')
      console.log('4. 清除 Next.js 缓存: rm -rf .next && npm run dev')
      process.exit(1)
    } else {
      console.log('✅ 所有配置检查通过！')
      console.log('\n如果支付仍然失败，请检查:')
      console.log('1. 浏览器控制台 (F12) 的错误信息')
      console.log('2. 服务器终端的 [Creem] 和 [Payment] 日志')
      console.log('3. Network 标签中 create-checkout 请求的响应')
      process.exit(0)
    }
  })
} else {
  console.log('⏭️  跳过 API 测试（配置不完整）')
  
  console.log('\n' + '='.repeat(50))
  console.log('\n📊 总结:\n')
  console.log('❌ 配置不完整，请先完成基本配置')
  process.exit(1)
}

