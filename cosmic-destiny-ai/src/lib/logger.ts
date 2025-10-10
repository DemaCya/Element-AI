/**
 * 持久化日志系统
 * 防止页面导航或控制台清除时丢失重要日志
 */

interface LogEntry {
  timestamp: string
  level: 'log' | 'warn' | 'error' | 'info'
  message: string
  data?: any
}

class PersistentLogger {
  private storageKey = 'cosmic-destiny-logs'
  private maxLogs = 100
  private enabled = typeof window !== 'undefined'

  // 添加日志到持久化存储
  private addLog(level: LogEntry['level'], message: string, data?: any) {
    if (!this.enabled) return

    try {
      const logs = this.getLogs()
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data
      }

      logs.push(entry)

      // 保持日志数量在限制内
      if (logs.length > this.maxLogs) {
        logs.shift()
      }

      localStorage.setItem(this.storageKey, JSON.stringify(logs))
    } catch (error) {
      // 静默失败，避免影响应用
    }
  }

  // 获取所有日志
  getLogs(): LogEntry[] {
    if (!this.enabled) return []

    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      return []
    }
  }

  // 清除日志
  clearLogs() {
    if (!this.enabled) return
    localStorage.removeItem(this.storageKey)
  }

  // 打印所有日志到控制台
  printLogs() {
    const logs = this.getLogs()
    console.log('=== 持久化日志 ===')
    console.log(`总共 ${logs.length} 条日志`)
    logs.forEach((log, index) => {
      const time = new Date(log.timestamp).toLocaleTimeString()
      const prefix = `[${index + 1}] [${time}] [${log.level.toUpperCase()}]`
      if (log.data) {
        console[log.level](prefix, log.message, log.data)
      } else {
        console[log.level](prefix, log.message)
      }
    })
  }

  // 导出日志为文本
  exportLogs(): string {
    const logs = this.getLogs()
    return logs.map(log => {
      const time = new Date(log.timestamp).toLocaleTimeString()
      const dataStr = log.data ? ` ${JSON.stringify(log.data)}` : ''
      return `[${time}] [${log.level.toUpperCase()}] ${log.message}${dataStr}`
    }).join('\n')
  }

  // 记录方法
  log(message: string, data?: any) {
    console.log(message, data)
    this.addLog('log', message, data)
  }

  warn(message: string, data?: any) {
    console.warn(message, data)
    this.addLog('warn', message, data)
  }

  error(message: string, data?: any) {
    console.error(message, data)
    this.addLog('error', message, data)
  }

  info(message: string, data?: any) {
    console.info(message, data)
    this.addLog('info', message, data)
  }

  // Supabase 专用日志
  supabase(message: string, data?: any) {
    const msg = `🔧 Supabase: ${message}`
    console.log(msg, data)
    this.addLog('log', msg, data)
  }
}

// 创建单例实例
export const logger = new PersistentLogger()

// 在浏览器环境中暴露到 window 对象，方便调试
if (typeof window !== 'undefined') {
  (window as any).cosmicLogger = {
    printLogs: () => logger.printLogs(),
    exportLogs: () => logger.exportLogs(),
    clearLogs: () => logger.clearLogs(),
    getLogs: () => logger.getLogs()
  }
  
  console.log('💡 调试工具已加载！使用以下命令：')
  console.log('  - cosmicLogger.printLogs()  // 打印所有持久化日志')
  console.log('  - cosmicLogger.exportLogs() // 导出日志为文本')
  console.log('  - cosmicLogger.clearLogs()  // 清除所有日志')
}

export default logger

