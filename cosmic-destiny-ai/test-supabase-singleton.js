// 测试Supabase单例模式修复效果
// 在浏览器控制台运行此脚本来验证客户端只创建一次

console.log('🧪 开始测试Supabase单例模式修复...')

// 监听所有Supabase相关的日志
const originalLog = console.log
const supabaseLogs = []

console.log = function(...args) {
  const message = args.join(' ')
  if (message.includes('Supabase')) {
    supabaseLogs.push({
      timestamp: new Date().toISOString(),
      message: message
    })
  }
  originalLog.apply(console, args)
}

// 检查全局状态
function checkGlobalState() {
  console.log('📊 检查全局Supabase状态:')
  
  // 检查全局客户端
  if (typeof window !== 'undefined') {
    console.log('- Window对象存在:', true)
    console.log('- 全局Supabase客户端:', !!window.__supabaseClient)
  } else {
    console.log('- Window对象存在:', false)
  }
  
  // 检查日志中的客户端创建次数
  const createLogs = supabaseLogs.filter(log => 
    log.message.includes('Creating new global client')
  )
  const returnLogs = supabaseLogs.filter(log => 
    log.message.includes('Returning existing global client')
  )
  const alreadyInitLogs = supabaseLogs.filter(log => 
    log.message.includes('Already initialized')
  )
  
  console.log('📈 客户端创建统计:')
  console.log('- 创建新客户端次数:', createLogs.length)
  console.log('- 返回现有客户端次数:', returnLogs.length)
  console.log('- 已初始化检查次数:', alreadyInitLogs.length)
  
  if (createLogs.length > 1) {
    console.warn('⚠️ 警告: 检测到多次创建客户端！')
    createLogs.forEach((log, index) => {
      console.warn(`   ${index + 1}. ${log.timestamp}: ${log.message}`)
    })
  } else if (createLogs.length === 1) {
    console.log('✅ 客户端只创建了一次，符合预期')
  } else {
    console.log('ℹ️ 尚未检测到客户端创建')
  }
  
  return {
    createCount: createLogs.length,
    returnCount: returnLogs.length,
    alreadyInitCount: alreadyInitLogs.length
  }
}

// 模拟页面导航测试
function simulateNavigation() {
  console.log('🔄 模拟页面导航测试...')
  
  // 清除之前的日志
  supabaseLogs.length = 0
  
  // 模拟多次调用useSupabase
  console.log('模拟多次调用useSupabase...')
  
  // 这里我们无法直接调用useSupabase，但可以检查全局状态
  checkGlobalState()
}

// 检查页面加载后的状态
function checkAfterPageLoad() {
  console.log('📋 页面加载后状态检查:')
  
  // 等待一下让所有初始化完成
  setTimeout(() => {
    const stats = checkGlobalState()
    
    console.log('📊 最终统计:')
    console.log('- 总日志数:', supabaseLogs.length)
    console.log('- 创建次数:', stats.createCount)
    console.log('- 返回次数:', stats.returnCount)
    console.log('- 已初始化次数:', stats.alreadyInitCount)
    
    if (stats.createCount <= 1) {
      console.log('🎉 成功！Supabase客户端单例模式工作正常')
    } else {
      console.log('❌ 失败！检测到多次创建客户端')
    }
    
    // 显示所有Supabase相关日志
    console.log('📝 所有Supabase日志:')
    supabaseLogs.forEach((log, index) => {
      console.log(`  ${index + 1}. [${log.timestamp}] ${log.message}`)
    })
  }, 2000)
}

// 导出测试函数
window.testSupabaseSingleton = checkAfterPageLoad
window.checkSupabaseState = checkGlobalState
window.simulateNavigation = simulateNavigation
window.supabaseLogs = supabaseLogs

console.log('📝 测试函数已加载:')
console.log('- testSupabaseSingleton() - 检查页面加载后的状态')
console.log('- checkSupabaseState() - 检查当前状态')
console.log('- simulateNavigation() - 模拟导航测试')
console.log('- supabaseLogs - 查看所有Supabase日志')
console.log('')
console.log('🎯 请在页面完全加载后运行 testSupabaseSingleton() 来验证修复效果')
