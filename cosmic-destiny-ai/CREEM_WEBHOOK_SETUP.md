# Creem Webhook 配置指南

> 详细说明：如何在 Creem Dashboard 中配置 Webhook

## 📍 Webhook 配置位置

Webhook 需要在 **Creem Dashboard** 中配置，不是在你的代码或 Vercel 中。

## 🔧 配置步骤

### 步骤 1: 访问 Creem Dashboard

1. 登录 [Creem Dashboard](https://creem.io/dashboard)
2. 点击左侧菜单或导航栏中的 **Developers** 或 **Settings**
3. 进入 [Developers 页面](https://creem.io/dashboard/developers)

### 步骤 2: 找到 Webhooks 部分

在 Developers 页面中，你应该能看到：

- **Test Webhooks** - 用于测试环境的 Webhook
- **Live Webhooks** - 用于生产环境的 Webhook

> ⚠️ **重要**：
> - 如果你在 **Test Mode**，只能配置 Test Webhooks
> - 如果你在 **Live Mode**（已关闭 Test Mode），只能配置 Live Webhooks

### 步骤 3: 确定你的 Webhook URL

#### 开发/测试环境

如果你在本地开发，需要使用 ngrok：

```bash
# 1. 安装 ngrok
npm install -g ngrok

# 2. 启动你的应用
npm run dev  # 运行在 http://localhost:3000

# 3. 在另一个终端启动 ngrok
ngrok http 3000

# 4. 复制 ngrok 提供的 HTTPS URL
# 例如: https://xxxx-xx-xx-xx-xx.ngrok.io
```

Webhook URL 格式：
```
https://你的ngrok地址.ngrok.io/api/payments/webhook
```

#### 生产环境

如果你的应用已部署到 Vercel：

1. 获取你的生产域名：
   - 在 Vercel Dashboard 找到你的项目
   - 复制部署的 URL（例如：`https://your-project.vercel.app`）
   - 或使用自定义域名（例如：`https://your-domain.com`）

2. Webhook URL 格式：
```
https://your-production-domain.com/api/payments/webhook
```

> 💡 **完整路径**：`/api/payments/webhook` 是你的 Next.js API 路由路径

### 步骤 4: 在 Creem Dashboard 添加 Webhook

1. 在 Creem Dashboard - Developers 页面
2. 找到 **Webhooks** 部分
3. 点击 **Add Webhook** 或 **Configure Webhook** 按钮
4. 在输入框中粘贴你的 Webhook URL：
   ```
   https://your-domain.com/api/payments/webhook
   ```
5. 点击 **Save** 或 **Add** 保存

> 📸 **参考**：Creem 官方文档中的截图示例
> ![Webhook 配置界面](https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/test-webhook-yBodvIWasxCmgr4bYqZJBlWg8qbUD2.png)

### 步骤 5: 验证 Webhook（可选）

Creem Dashboard 通常提供测试功能：

1. 点击 **Test Webhook** 按钮
2. 应该返回 `200 OK` 状态
3. 检查你的服务器日志（Vercel 日志）确认收到请求

## 🎯 不同环境的配置

### 测试环境配置

**前提**：Creem Dashboard 处于 **Test Mode**

1. Webhook URL：
   ```
   https://your-ngrok-url.ngrok.io/api/payments/webhook
   ```
   或使用 Vercel Preview URL：
   ```
   https://your-preview.vercel.app/api/payments/webhook
   ```

2. 在 **Test Webhooks** 部分添加

### 生产环境配置

**前提**：Creem Dashboard 已**关闭 Test Mode**（Live Mode）

1. Webhook URL：
   ```
   https://your-production-domain.com/api/payments/webhook
   ```

2. 在 **Live Webhooks** 部分添加

> ⚠️ **重要**：测试环境和生产环境需要使用不同的 Webhook URL，因为它们指向不同的部署环境。

## 🔍 你的 Webhook 端点代码

Webhook 端点已实现在：

```
src/app/api/payments/webhook/route.ts
```

这个端点：
- ✅ 接收 POST 请求
- ✅ 处理 `checkout.completed` 事件
- ✅ 自动解锁报告（设置 `is_paid = true`）
- ✅ 创建支付记录
- ✅ 返回 200 OK 给 Creem

## ✅ 验证 Webhook 是否工作

### 方法 1: 完成测试支付

1. 在你的应用完成一次支付
2. 查看 Vercel 日志（或本地开发日志）
3. 应该看到：
   ```
   [Webhook] ========== Webhook Received ==========
   [Webhook] Event Type: checkout.completed
   ```

### 方法 2: 检查数据库

支付成功后，检查：

1. `user_reports` 表中对应报告的 `is_paid` 应为 `true`
2. `payments` 表中应有新的支付记录

### 方法 3: 使用 curl 测试（可选）

```bash
curl -X POST https://your-domain.com/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "checkout.completed",
    "object": {
      "id": "ch_test_123",
      "request_id": "your-report-id",
      "order": {
        "id": "ord_test_123",
        "amount_paid": 1999
      }
    }
  }'
```

## 🐛 常见问题

### Q1: 找不到 Webhooks 配置入口？

**A:** 
- 确认你在 **Developers** 页面：`https://creem.io/dashboard/developers`
- 如果在 Settings 中，查找 "Webhooks" 或 "Notifications" 选项

### Q2: 只能看到 Test Webhooks，没有 Live Webhooks？

**A:** 
- 确认你已**关闭 Test Mode**
- 在 Dashboard 顶部找到 Test Mode 开关，点击关闭
- 刷新页面后应该能看到 Live Webhooks

### Q3: Webhook 测试失败？

**A:** 检查：
1. ✅ Webhook URL 是否正确（必须是 HTTPS）
2. ✅ URL 是否可公开访问（可以用浏览器访问）
3. ✅ 路径是否正确（必须是 `/api/payments/webhook`）
4. ✅ 服务器是否正常运行

### Q4: 支付成功但没有收到 Webhook？

**A:** 
1. 确认 Webhook URL 已正确配置
2. 检查 Vercel 日志是否有错误
3. 确认 Creem Dashboard 的 Webhook 事件日志（如果有）
4. 检查 Creem 是否在重试（Creem 会自动重试失败的 Webhook）

### Q5: Webhook 收到但处理失败？

**A:** 检查 Vercel 日志：
```
[Webhook] Error: ...
```
常见原因：
- Supabase 环境变量未设置
- 数据库连接问题
- 报告 ID 不存在

## 📝 Webhook 事件说明

你的代码目前处理的事件：

| 事件类型 | 说明 | 代码处理 |
|---------|------|---------|
| `checkout.completed` | 支付完成 | ✅ 解锁报告 |

其他事件（如 `checkout.failed`）目前被忽略，但不会导致错误。

## 🔒 Webhook 安全性

> 💡 **当前实现**：代码中已实现基本的 Webhook 处理，但**建议**在生产环境添加签名验证。

Creem 可能会在未来要求验证 Webhook 签名。如果 Creem 提供签名验证机制，你应该：

1. 在代码中验证签名
2. 拒绝未签名的请求

参考 Creem 官方文档了解签名验证方法。

## 📚 相关文档

- [Creem 官方文档 - Webhooks](./creem.md#introduction-2)
- [Webhook 端点实现](./src/app/api/payments/webhook/route.ts)
- [生产环境切换指南](./CREEM_PRODUCTION_MIGRATION.md)

## ✅ 配置完成检查清单

- [ ] 已访问 Creem Dashboard - Developers 页面
- [ ] 已找到 Webhooks 配置部分
- [ ] 已确定正确的 Webhook URL（测试或生产）
- [ ] 已在 Creem Dashboard 添加 Webhook URL
- [ ] 已点击 Save 保存
- [ ] 已测试 Webhook（可选但推荐）
- [ ] 完成测试支付验证 Webhook 工作正常

---

**需要帮助？** 如果遇到问题，请检查：
1. Creem Dashboard 的 Webhook 配置是否正确
2. Webhook URL 是否可以访问
3. Vercel 日志中的 Webhook 处理记录

