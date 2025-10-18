# Creem 支付集成测试指南

## 🧪 测试前准备

### 1. 环境配置

确保你已经配置了所有必需的环境变量：

```bash
# 复制环境变量模板
cp env.example .env.local

# 编辑 .env.local 并填入你的凭证
# CREEM_API_KEY_TEST=creem_test_xxxxx
# CREEM_PRODUCT_ID=prod_xxxxx
# CREEM_MODE=test
```

### 2. 数据库迁移

运行数据库迁移脚本：

```sql
-- 在 Supabase SQL Editor 中执行
-- 运行文件: supabase/migrations/005_add_creem_payment_fields.sql
```

或者使用 Supabase CLI：

```bash
supabase db push
```

### 3. 启动开发服务器

```bash
npm install
npm run dev
```

应用将在 http://localhost:3000 运行。

## 🔧 本地测试（使用 ngrok）

### 1. 安装并启动 ngrok

```bash
# 安装 ngrok (如果还没有)
npm install -g ngrok

# 在新终端窗口中启动 ngrok
ngrok http 3000
```

你会看到类似这样的输出：

```
Forwarding  https://1234-abc-def.ngrok.io -> http://localhost:3000
```

### 2. 配置 Creem Webhook

1. 访问 [Creem Dashboard - Developers](https://creem.io/dashboard/developers)
2. 在 "Test Webhooks" 部分添加：
   ```
   https://your-ngrok-url.ngrok.io/api/payments/webhook
   ```
3. 保存配置

### 3. 测试 Webhook 连接

在 Creem Dashboard 中点击 "Test Webhook" 按钮，你应该能在终端看到日志输出。

## 🎯 测试场景

### 场景 1: 完整支付流程

#### 步骤：

1. **登录应用**
   ```
   访问: http://localhost:3000/auth
   创建测试账户或登录
   ```

2. **生成预览报告**
   ```
   访问: http://localhost:3000/generate
   填写出生信息并提交
   等待预览报告生成
   ```

3. **查看 Dashboard**
   ```
   访问: http://localhost:3000/dashboard
   应该看到你的报告，状态为"未解锁"
   ```

4. **触发支付流程**
   ```
   点击报告上的"解锁完整报告"按钮
   应该跳转到 Creem 支付页面
   ```

5. **完成支付**
   ```
   在 Creem 页面完成测试支付
   （测试模式下可能有特殊的支付方式）
   ```

6. **验证返回**
   ```
   应该自动跳转回: /payment/success
   看到支付成功页面
   ```

7. **查看完整报告**
   ```
   点击"查看完整报告"
   应该能看到完整的命理分析
   ```

#### 预期结果：

✅ 用户可以看到完整报告  
✅ 报告标记为已付费  
✅ 数据库中有支付记录  
✅ 支付状态为 'completed'

### 场景 2: 取消支付

#### 步骤：

1. 按照场景 1 的步骤 1-4 操作
2. 在 Creem 支付页面点击"取消"或关闭窗口
3. 应该跳转到 `/payment/cancel`

#### 预期结果：

✅ 显示支付取消页面  
✅ 用户可以返回 Dashboard  
✅ 报告仍然处于锁定状态  
✅ 数据库中有支付记录，状态为 'pending'

### 场景 3: Webhook 处理

#### 步骤：

1. 在 Creem Dashboard 找到你的测试支付
2. 点击 "Resend Webhook"
3. 查看应用日志

#### 预期日志：

```
[Webhook] Received webhook request
[Webhook] Event type: payment.success
[Webhook] Processing payment success: { checkout_id: '...', order_id: '...' }
[Webhook] Generating full report...
[Webhook] Full report generated successfully
[Webhook] Payment processed successfully
```

#### 预期结果：

✅ Webhook 返回 200 OK  
✅ 支付状态更新为 'completed'  
✅ 报告标记为已付费  
✅ 完整报告已生成

### 场景 4: 签名验证

#### 测试方法：

1. 打开浏览器开发者工具
2. 完成一次支付
3. 在返回 URL 中手动修改参数（如 order_id）
4. 访问修改后的 URL

#### 预期结果：

❌ 签名验证失败  
❌ 显示错误消息  
✅ 报告不会被解锁

### 场景 5: 重复支付检测

#### 步骤：

1. 完成一次支付，解锁报告
2. 尝试再次点击"解锁完整报告"

#### 预期结果：

✅ 按钮显示为"已解锁"或隐藏  
✅ 如果强制请求，API 返回错误  
✅ 不创建新的支付记录

## 🔍 调试技巧

### 查看日志

```bash
# 应用日志
# 在运行 npm run dev 的终端中查看

# 查找特定事件
# [Payment] - 支付相关日志
# [Webhook] - Webhook 处理日志
# [Creem] - Creem API 调用日志
```

### 检查数据库

```sql
-- 查看所有支付记录
SELECT * FROM payments ORDER BY created_at DESC;

-- 查看特定用户的支付
SELECT p.*, ur.name, ur.is_paid 
FROM payments p
JOIN user_reports ur ON p.report_id = ur.id
WHERE p.user_id = 'your-user-id';

-- 查看待处理的支付
SELECT * FROM payments WHERE status = 'pending';

-- 查看最近的 webhook 事件
SELECT * FROM payments WHERE updated_at > NOW() - INTERVAL '1 hour';
```

### 测试 API 端点

```bash
# 测试健康检查
curl http://localhost:3000/api/health

# 测试创建 checkout（需要认证 token）
curl -X POST http://localhost:3000/api/payments/create-checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"reportId": "report-id-here"}'

# 测试支付验证
curl http://localhost:3000/api/payments/verify?checkout_id=ch_xxxxx \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 使用 Creem Dashboard

1. **查看支付**
   - Dashboard > Payments
   - 查看所有测试支付记录

2. **查看 Webhook 日志**
   - Dashboard > Developers > Webhooks
   - 查看每个 webhook 的请求和响应

3. **重新发送 Webhook**
   - 在支付详情中点击 "Resend Webhook"
   - 用于测试 webhook 处理逻辑

## 📝 测试检查清单

### 功能测试

- [ ] 用户可以登录/注册
- [ ] 可以生成预览报告
- [ ] 预览报告正确显示
- [ ] "解锁"按钮正确显示
- [ ] 点击按钮跳转到 Creem
- [ ] Creem 页面显示正确的产品信息
- [ ] 完成支付后正确返回
- [ ] 返回页面显示成功消息
- [ ] 完整报告正确生成
- [ ] 报告状态更新为已付费
- [ ] 用户可以查看完整报告
- [ ] 取消支付正确处理
- [ ] 已付费报告不能再次付费

### Webhook 测试

- [ ] Webhook 端点可访问
- [ ] 接收 payment.success 事件
- [ ] 接收 payment.failed 事件
- [ ] 接收 payment.refunded 事件
- [ ] 签名验证工作正常
- [ ] 幂等性处理（重复 webhook）
- [ ] 错误处理正确
- [ ] 日志记录完整

### 安全测试

- [ ] 需要认证才能创建支付
- [ ] 用户只能为自己的报告付费
- [ ] 签名验证防止篡改
- [ ] API Key 不暴露在前端
- [ ] Webhook 签名验证（如启用）
- [ ] 防止重复支付
- [ ] HTTPS 强制（生产环境）

### 数据完整性

- [ ] 支付记录正确创建
- [ ] 支付状态正确更新
- [ ] 报告状态与支付同步
- [ ] 所有字段正确填充
- [ ] 时间戳正确
- [ ] 关联关系正确

## 🐛 常见问题

### 问题 1: Webhook 收不到

**可能原因：**
- ngrok 未运行
- Webhook URL 配置错误
- 防火墙阻止

**解决方案：**
```bash
# 确认 ngrok 运行中
ngrok http 3000

# 检查 URL 配置
# Dashboard > Developers > Webhooks

# 测试连接
curl -X POST https://your-ngrok-url.ngrok.io/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"test","data":{}}'
```

### 问题 2: 签名验证失败

**可能原因：**
- API Key 不正确
- 参数顺序错误
- 编码问题

**解决方案：**
```typescript
// 在 paymentService.ts 中添加日志
console.log('Verifying signature:', {
  params: sortedParams,
  signature: signature,
  expected: expectedSignature
})
```

### 问题 3: 完整报告未生成

**可能原因：**
- Gemini API 错误
- API 配额用完
- 网络问题

**解决方案：**
```bash
# 检查 Gemini API Key
echo $GEMINI_API_KEY

# 查看详细错误日志
# 在 webhook 处理日志中查找错误

# 手动重试
# 在 Creem Dashboard 中重新发送 webhook
```

### 问题 4: 数据库错误

**可能原因：**
- 迁移未运行
- 权限问题
- 字段类型不匹配

**解决方案：**
```sql
-- 检查表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments';

-- 检查约束
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'payments';

-- 重新运行迁移
-- 在 Supabase SQL Editor 中执行迁移脚本
```

## 🚀 准备上线

在部署到生产环境之前：

1. **切换到生产模式**
   ```env
   CREEM_MODE=live
   CREEM_API_KEY=creem_live_xxxxx
   ```

2. **配置生产 Webhook**
   ```
   https://your-domain.com/api/payments/webhook
   ```

3. **运行完整测试套件**
   - 在生产环境完成一次真实测试
   - 使用小额支付进行测试
   - 立即退款测试支付

4. **启用监控**
   - 配置错误追踪（如 Sentry）
   - 设置支付失败告警
   - 监控 webhook 成功率

5. **准备支持**
   - 准备退款流程
   - 准备客服响应模板
   - 测试退款功能

## 📊 性能测试

### 负载测试

```bash
# 使用 Apache Bench 测试
ab -n 100 -c 10 http://localhost:3000/api/health

# 测试支付创建（需要脚本）
# 创建 100 个并发支付请求
```

### 响应时间监控

```typescript
// 在 API 路由中添加性能日志
const startTime = Date.now()
// ... 处理逻辑
console.log(`[Performance] Request took ${Date.now() - startTime}ms`)
```

## ✅ 测试完成

完成所有测试后，你应该确认：

✅ 所有测试场景通过  
✅ 所有检查清单项目完成  
✅ 没有未解决的错误  
✅ 日志记录完整  
✅ 文档已更新  
✅ 团队已培训  

恭喜！你的 Creem 支付集成已准备就绪！ 🎉

