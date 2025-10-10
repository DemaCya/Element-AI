# 测试指南 - Supabase 和日志修复

## 快速测试步骤

### 1️⃣ 启动开发服务器

```bash
npm run dev
```

### 2️⃣ 测试日志持久化

1. 打开浏览器访问 `http://localhost:3000`
2. 打开浏览器开发者工具（F12）
3. 在控制台中，你应该看到欢迎消息：
   ```
   💡 调试工具已加载！使用以下命令：
     - cosmicLogger.printLogs()  // 打印所有持久化日志
     - cosmicLogger.exportLogs() // 导出日志为文本
     - cosmicLogger.clearLogs()  // 清除所有日志
   ```

4. 导航到不同页面（Dashboard、Report 等）
5. **清除控制台**（Ctrl+L 或 Cmd+K）
6. 运行命令：
   ```javascript
   cosmicLogger.printLogs()
   ```
7. **验证**：你应该能看到所有之前的日志，包括清除控制台之前的日志

### 3️⃣ 测试 Supabase 客户端单例

1. 清除日志（可选）：
   ```javascript
   cosmicLogger.clearLogs()
   ```

2. 刷新页面

3. 查看日志：
   ```javascript
   cosmicLogger.printLogs()
   ```

4. **预期输出**（第一次加载）：
   ```
   [time] [LOG] 🔧 Supabase: Creating new global client (call #1)
   [time] [LOG] 🔧 Supabase: Initializing for the first time (call #1)
   [time] [LOG] 🔧 Supabase: ✅ Global client created and cached successfully
   [time] [LOG] 🔧 Supabase: ✅ Global state initialized successfully
   ```

5. 导航到 Dashboard，然后运行：
   ```javascript
   cosmicLogger.printLogs()
   ```

6. **预期输出**（应该看到）：
   ```
   [time] [LOG] 🔧 Supabase: Already initialized (call #2), returning existing state
   [time] [LOG] 🔧 Supabase: Returning existing global client (call #2)
   ```

7. **验证**：
   - ✅ 客户端只创建一次（call #1）
   - ✅ 后续都是返回现有客户端（call #2, #3...）
   - ✅ initCount 随着页面导航增加，但实际只创建了一个客户端

### 4️⃣ 测试 Dashboard 加载

1. 确保已登录（如果没有，先注册/登录）

2. 访问 Dashboard (`/dashboard`)

3. 在控制台查看日志：
   ```javascript
   cosmicLogger.printLogs()
   ```

4. **预期日志流程**：
   ```
   [time] [LOG] 🔍 Dashboard useEffect triggered: { authLoading: false, userId: 'xxx', hasUser: true }
   [time] [LOG] 👤 Dashboard: User found, fetching reports
   [time] [LOG] 📊 Dashboard: Fetching reports for user: xxx
   [time] [LOG] ✅ Dashboard: Fetched reports: X reports
   ```

5. **验证**：
   - ✅ 没有重复的 useEffect 触发
   - ✅ 报告列表正常加载
   - ✅ 没有无限循环的日志

### 5️⃣ 测试 Report 页面（关键测试）

这是最重要的测试，因为之前会卡在 loading。

1. 在 Dashboard 中，点击任意一个命理报告

2. **预期行为**：
   - ✅ 页面应该立即开始加载
   - ✅ 显示 loading 动画
   - ✅ 1-2 秒内加载完成，显示报告内容
   - ✅ **不会**卡在 loading 页面

3. 查看控制台日志：
   ```javascript
   cosmicLogger.printLogs()
   ```

4. **预期日志流程**：
   ```
   [time] [LOG] 🔍 Report useEffect triggered: { authLoading: false, userId: 'xxx', hasUser: true }
   [time] [LOG] 👤 Report: User found, fetching report
   [time] [LOG] 📄 Report: fetchReport called with: { reportId: 'xxx', userId: 'xxx' }
   [time] [LOG] 🔍 Report: Fetching report with ID: xxx
   [time] [LOG] ✅ Report: Report fetched successfully
   ```

5. **验证**：
   - ✅ 没有 "No user yet, waiting..." 导致的死循环
   - ✅ loading 状态正确管理
   - ✅ 报告内容正常显示

### 6️⃣ 测试页面导航循环

测试多次页面导航，确保没有内存泄漏或客户端重复创建。

1. 按以下顺序导航：
   ```
   首页 → Dashboard → Report → Dashboard → Report → Dashboard
   ```

2. 查看完整日志：
   ```javascript
   cosmicLogger.printLogs()
   ```

3. **验证 Supabase 客户端创建**：
   - 搜索 "Creating new global client"
   - 应该**只出现一次**
   - 其余都应该是 "Returning existing global client"

4. **查看统计**：
   ```javascript
   // 在控制台运行（如果暴露了这个函数）
   console.log('Init count:', globalSupabaseState.initCount)
   ```

   或者通过日志查看 call 编号：
   - 第一次：call #1（创建）
   - 第二次：call #2（返回现有）
   - 第三次：call #3（返回现有）
   - ...

### 7️⃣ 压力测试（可选）

1. 快速连续点击多个报告
2. 快速在多个页面间切换
3. 查看日志：
   ```javascript
   cosmicLogger.printLogs()
   ```
4. **验证**：
   - ✅ 没有错误
   - ✅ 客户端始终只创建一次
   - ✅ 所有请求都正常完成

---

## 常见问题排查

### 问题 1：看不到 cosmicLogger

**症状**：在控制台输入 `cosmicLogger` 显示 undefined

**排查**：
1. 确保页面已经完全加载
2. 刷新页面
3. 检查控制台是否有 JavaScript 错误
4. 确保 `src/lib/logger.ts` 文件存在且被正确导入

### 问题 2：日志显示 "Already initialized" 但实际创建了多个客户端

**症状**：日志显示已初始化，但 call 编号一直是 #1

**排查**：
1. 检查是否有多个 SupabaseProvider
2. 检查 layout.tsx 是否正确配置
3. 运行 `cosmicLogger.clearLogs()` 清除旧日志后重新测试

### 问题 3：报告页面仍然卡在 loading

**症状**：点击报告后一直显示 loading 动画

**排查**：
1. 查看日志：
   ```javascript
   cosmicLogger.printLogs()
   ```
2. 搜索 "Report:" 相关日志
3. 检查是否有错误日志
4. 确认用户是否已登录：
   ```javascript
   // 在 Report 页面控制台运行
   console.log('User:', user)
   ```

### 问题 4：控制台日志仍然被清除

**症状**：导航时控制台日志消失

**可能原因**：
1. 浏览器设置了 "清除日志"
2. 某些浏览器扩展干扰

**解决方案**：
1. 使用持久化日志：`cosmicLogger.printLogs()`
2. 检查浏览器控制台设置，启用 "Preserve log"
3. 使用 `cosmicLogger.exportLogs()` 导出日志文本

---

## 成功标准

所有以下条件都应该满足：

- ✅ `cosmicLogger` 在浏览器控制台可用
- ✅ Supabase 客户端只创建一次
- ✅ 页面导航流畅，无卡顿
- ✅ Dashboard 正常加载报告列表
- ✅ Report 页面正常加载，不卡在 loading
- ✅ 日志持久化，清除控制台后仍可查看
- ✅ 没有 useEffect 无限循环
- ✅ 没有控制台错误

---

## 开发者调试技巧

### 1. 实时监控日志

```javascript
// 每 3 秒自动打印日志
setInterval(() => {
  console.clear()
  cosmicLogger.printLogs()
}, 3000)
```

### 2. 导出日志到文件

```javascript
// 导出日志
const logs = cosmicLogger.exportLogs()

// 创建下载
const blob = new Blob([logs], { type: 'text/plain' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'cosmic-destiny-logs.txt'
a.click()
```

### 3. 过滤特定日志

```javascript
// 只查看 Supabase 相关日志
const logs = cosmicLogger.getLogs()
const supabaseLogs = logs.filter(log => log.message.includes('Supabase'))
console.table(supabaseLogs)
```

### 4. 统计日志级别

```javascript
const logs = cosmicLogger.getLogs()
const stats = logs.reduce((acc, log) => {
  acc[log.level] = (acc[log.level] || 0) + 1
  return acc
}, {})
console.log('日志统计:', stats)
```

---

## 反馈

如果在测试过程中遇到任何问题，请：

1. 运行 `cosmicLogger.exportLogs()` 导出日志
2. 截图错误信息
3. 记录重现步骤
4. 提供浏览器和环境信息

祝测试顺利！🚀

