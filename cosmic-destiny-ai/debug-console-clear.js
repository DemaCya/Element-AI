// 调试控制台日志清除问题
// 在浏览器控制台运行此脚本来跟踪日志清除的原因

console.log('🔍 开始调试控制台日志清除问题...')

// 保存原始的console方法
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  clear: console.clear,
  info: console.info
}

// 跟踪所有console调用
let consoleCallCount = 0
let lastClearTime = null
let clearCallStack = null

// 重写console.clear来跟踪清除操作
console.clear = function() {
  consoleCallCount++
  lastClearTime = new Date().toISOString()
  clearCallStack = new Error().stack
  
  console.log('🚨 检测到console.clear()调用!')
  console.log('📅 清除时间:', lastClearTime)
  console.log('📊 调用次数:', consoleCallCount)
  console.log('📍 调用栈:', clearCallStack)
  
  // 调用原始clear方法
  originalConsole.clear.apply(console, arguments)
}

// 重写console.log来跟踪日志
const originalLog = console.log
console.log = function(...args) {
  const message = args.join(' ')
  
  // 记录Supabase相关日志
  if (message.includes('Supabase')) {
    console.log('📝 Supabase日志:', message)
    console.log('⏰ 时间:', new Date().toISOString())
  }
  
  // 调用原始log方法
  originalLog.apply(console, arguments)
}

// 监听页面导航事件
window.addEventListener('beforeunload', function() {
  console.log('🔄 页面即将卸载')
})

window.addEventListener('unload', function() {
  console.log('🔄 页面已卸载')
})

// 监听路由变化（如果使用Next.js router）
if (typeof window !== 'undefined' && window.next) {
  console.log('🔍 检测到Next.js环境')
}

// 检查是否有开发工具
function checkDevTools() {
  console.log('🔧 检查开发工具状态:')
  
  // 检查Chrome DevTools
  if (window.chrome && window.chrome.runtime) {
    console.log('- Chrome扩展环境:', true)
  }
  
  // 检查是否有React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('- React DevTools:', true)
  }
  
  // 检查是否有Redux DevTools
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log('- Redux DevTools:', true)
  }
  
  // 检查控制台是否被重写
  if (console.clear !== originalConsole.clear) {
    console.log('- Console已被重写:', true)
  }
}

// 检查页面性能API
function checkPerformanceAPI() {
  if (typeof performance !== 'undefined') {
    console.log('📊 Performance API可用:', true)
    
    // 检查是否有性能观察器
    if (typeof PerformanceObserver !== 'undefined') {
      console.log('- PerformanceObserver可用:', true)
    }
  }
}

// 检查是否有热重载
function checkHotReload() {
  if (typeof module !== 'undefined' && module.hot) {
    console.log('🔥 检测到热重载环境')
  }
  
  if (typeof window !== 'undefined' && window.webpackHotUpdate) {
    console.log('🔥 检测到Webpack热更新')
  }
}

// 主检查函数
function runDiagnostics() {
  console.log('🔍 运行诊断检查...')
  console.log('='.repeat(50))
  
  checkDevTools()
  console.log('')
  
  checkPerformanceAPI()
  console.log('')
  
  checkHotReload()
  console.log('')
  
  console.log('📊 当前状态:')
  console.log('- Console调用次数:', consoleCallCount)
  console.log('- 最后清除时间:', lastClearTime || '未检测到')
  console.log('- 当前时间:', new Date().toISOString())
}

// 持续监控
function startMonitoring() {
  console.log('👀 开始持续监控...')
  
  // 每5秒检查一次状态
  const interval = setInterval(() => {
    if (consoleCallCount > 0) {
      console.log('⚠️ 检测到console.clear调用，停止监控')
      clearInterval(interval)
    }
  }, 5000)
  
  // 10分钟后自动停止
  setTimeout(() => {
    clearInterval(interval)
    console.log('⏰ 监控超时，自动停止')
  }, 600000)
}

// 导出函数
window.debugConsoleClear = {
  runDiagnostics,
  startMonitoring,
  getStats: () => ({
    callCount: consoleCallCount,
    lastClearTime,
    clearCallStack
  })
}

console.log('📝 调试函数已加载:')
console.log('- debugConsoleClear.runDiagnostics() - 运行诊断检查')
console.log('- debugConsoleClear.startMonitoring() - 开始持续监控')
console.log('- debugConsoleClear.getStats() - 获取统计信息')
console.log('')
console.log('🎯 请运行 debugConsoleClear.runDiagnostics() 开始检查')
