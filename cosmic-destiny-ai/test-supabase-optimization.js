// 测试Supabase客户端优化效果
// 这个脚本可以添加到浏览器控制台来测试客户端创建情况

console.log('🧪 开始测试Supabase客户端优化...')

// 检查全局客户端状态
function checkSupabaseStatus() {
  console.log('📊 Supabase客户端状态检查:')
  console.log('- 全局客户端存在:', !!globalThis.__supabaseClient)
  console.log('- Window客户端存在:', !!(window as any).__supabaseClient)
  console.log('- 全局计数器:', globalThis.__supabaseCreationCount || 0)
  
  // 检查React Context中的客户端
  const reactRoot = document.querySelector('#__next')
  if (reactRoot) {
    console.log('- React根元素存在:', true)
  } else {
    console.log('- React根元素存在:', false)
  }
}

// 模拟多次调用createClient来测试单例模式
function testSingletonPattern() {
  console.log('🔄 测试单例模式...')
  
  // 模拟多次调用
  const calls = 5
  const startTime = performance.now()
  
  for (let i = 0; i < calls; i++) {
    try {
      // 这里我们不能直接调用createClient，因为它在模块中
      // 但我们可以检查全局状态
      console.log(`调用 ${i + 1}: 全局客户端存在 = ${!!globalThis.__supabaseClient}`)
    } catch (error) {
      console.error(`调用 ${i + 1} 失败:`, error)
    }
  }
  
  const endTime = performance.now()
  console.log(`⏱️ 完成 ${calls} 次检查用时: ${(endTime - startTime).toFixed(2)}ms`)
}

// 检查页面中的Supabase使用情况
function checkPageUsage() {
  console.log('🔍 检查页面中的Supabase使用情况...')
  
  // 检查是否有多个Supabase实例
  const supabaseElements = document.querySelectorAll('[data-supabase]')
  console.log('- 页面中的Supabase元素数量:', supabaseElements.length)
  
  // 检查控制台日志中的Supabase创建信息
  console.log('- 请查看控制台中的Supabase创建日志')
  console.log('- 应该只看到一次 "Creating new global client" 日志')
  console.log('- 后续应该都是 "Returning existing global client" 日志')
}

// 运行所有测试
function runAllTests() {
  console.log('🚀 运行Supabase优化测试...')
  console.log('='.repeat(50))
  
  checkSupabaseStatus()
  console.log('')
  
  testSingletonPattern()
  console.log('')
  
  checkPageUsage()
  console.log('')
  
  console.log('✅ 测试完成！')
  console.log('💡 如果看到多次 "Creating new global client"，说明优化未生效')
  console.log('💡 如果只看到一次 "Creating new global client"，说明优化成功')
}

// 导出测试函数到全局作用域
window.testSupabaseOptimization = runAllTests
window.checkSupabaseStatus = checkSupabaseStatus

console.log('📝 测试函数已加载到全局作用域:')
console.log('- testSupabaseOptimization() - 运行完整测试')
console.log('- checkSupabaseStatus() - 检查客户端状态')
console.log('')
console.log('🎯 请在页面加载完成后运行 testSupabaseOptimization() 来测试优化效果')
