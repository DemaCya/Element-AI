# 流式传输后台任务实现说明

## 🎯 核心目标

实现**即使前端关闭页面，后台也能继续接收流式数据并保存到数据库**的功能。

## 🔑 关键原理

### 1. **异步任务独立性**

在 Next.js/Vercel 的服务器环境中，`ReadableStream` 的 `start` 方法中启动的异步任务（`for await` 循环）会独立运行，**不会因为客户端断开连接而自动终止**。

```typescript
const stream = new ReadableStream({
  async start(controller) {
    // 这个后台任务会一直运行，即使前端断开
    const backgroundTask = async () => {
      for await (const chunk of zhipuService.generateBaziReportStream(...)) {
        // 数据处理和保存逻辑
      }
    }
    backgroundTask() // 立即启动，不等待
  }
})
```

### 2. **连接状态检测**

使用 `clientConnected` 标志来跟踪客户端是否还在线：

```typescript
let clientConnected = true

// 在 cancel() 方法中检测断开
cancel() {
  clientConnected = false
  // 后台任务继续运行
}

// 在循环中检查状态
if (clientConnected) {
  try {
    controller.enqueue(...) // 尝试发送
  } catch {
    clientConnected = false // 捕获错误，标记为断开
  }
}
```

### 3. **错误处理策略**

- **发送数据失败**（连接断开）：捕获异常，标记为断开，但**不中断**后台任务
- **数据库保存失败**：记录错误，但**继续接收**后续数据
- **API调用失败**：保存已接收的内容，避免数据丢失

### 4. **关键代码位置**

#### 在 `/api/reports/generate-stream/route.ts` 中：

1. **后台任务启动**（第89-244行）：
   - 将整个流式处理逻辑包装在独立的 `backgroundTask` 函数中
   - 使用 `backgroundTask().catch()` 确保错误不会中断任务

2. **客户端断开处理**（第253-258行）：
   - `cancel()` 方法只在连接被主动取消时调用
   - 只是标记状态，不中断后台任务

3. **数据发送保护**（第159-177行）：
   - 先检查 `clientConnected` 状态
   - 使用 `try-catch` 包裹 `controller.enqueue()`
   - 如果发送失败，标记为断开，但**继续执行**后续代码

4. **数据库保存**（第117-156行）：
   - 数据库操作独立于客户端连接
   - 即使前端断开，保存操作继续执行
   - 使用单独的 `try-catch`，确保保存失败不影响数据接收

## 📊 执行流程

```
客户端请求流式传输
    ↓
创建 ReadableStream
    ↓
启动 backgroundTask (异步，不阻塞)
    ↓
开始接收 ZhipuAI 流式数据
    │
    ├─→ [如果客户端在线]
    │   └─→ 发送数据到前端
    │
    ├─→ [处理预览边界]
    │   └─→ 保存预览版到数据库
    │
    ├─→ [分批保存]
    │   └─→ 每3000字符或30秒保存一次
    │
    └─→ [客户端断开] (可能发生)
        └─→ 标记 clientConnected = false
        └─→ 继续接收和保存数据 (后台任务继续)
```

## 🔍 关键要点

### ✅ 为什么能继续运行？

1. **Node.js 事件循环**：`for await` 循环在事件循环中运行，不会因为 HTTP 连接断开而停止
2. **Promise 链独立**：`backgroundTask()` 返回的 Promise 独立于 HTTP 响应
3. **异步生成器**：`generateBaziReportStream()` 返回的异步生成器会继续产生数据，直到完成

### ⚠️ 注意事项

1. **Vercel 函数超时**：
   - Hobby 计划：10秒超时
   - Pro 计划：60秒超时
   - 如果报告生成超过超时时间，可能会被中断
   - **解决方案**：考虑使用 Vercel Cron Jobs 或 Edge Functions（更长超时）

2. **内存使用**：
   - 所有数据都在内存中累积（`fullContent`）
   - 如果报告非常大，可能消耗较多内存
   - **当前设计**：分批保存减少内存压力

3. **网络中断处理**：
   - 如果是网络问题导致中断（不是用户主动关闭），`cancel()` 可能不会被调用
   - 我们依赖 `controller.enqueue()` 的异常来检测断开

## 🧪 测试场景

1. **正常流程**：
   - 前端接收数据，正常显示 ✅

2. **用户关闭页面**：
   - 后台继续接收并保存 ✅
   - 用户重新打开页面，能看到完整报告 ✅

3. **网络中断**：
   - 后台继续接收并保存 ✅
   - 网络恢复后，用户刷新页面，能看到完整报告 ✅

4. **长时间生成**（超过超时时间）：
   - 可能被 Vercel 中断 ⚠️
   - 建议升级到 Pro 计划或使用其他方案

## 💡 优化建议

如果遇到超时问题，可以考虑：

1. **使用 Vercel Background Functions**（如果可用）
2. **使用队列系统**（如 BullMQ, Bull）
3. **拆分任务**：先快速生成预览，后台生成完整报告
4. **使用 Edge Functions**（更长超时）

## 📝 日志示例

正常流程：
```
🚀 [Stream API] Starting streaming generation for report: abc123
📝 [Stream API] Preview saved at 1800 characters
💾 [Stream API] Batch saved at 3000 characters
💾 [Stream API] Batch saved at 6000 characters
✅ [Stream API] Final save complete, total length: 8500
```

客户端断开：
```
🚀 [Stream API] Starting streaming generation for report: abc123
📝 [Stream API] Preview saved at 1800 characters
⚠️ [Stream API] Client disconnected, continuing background task...
📡 [Stream API] Client disconnected, skipping enqueue for chunk at 3500 characters
💾 [Stream API] Batch saved at 6000 characters
✅ [Stream API] Final save complete, total length: 8500
```

