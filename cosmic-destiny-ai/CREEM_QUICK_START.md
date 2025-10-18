# 🚀 Creem 支付集成 - 快速入门

> 10分钟内完成 Creem 支付集成配置

## 📋 前置要求

- ✅ Node.js 18+ 已安装
- ✅ Creem 账户已创建
- ✅ Supabase 项目已设置
- ✅ 项目代码已下载

## 🎯 5 步快速配置

### 步骤 1: 创建 Creem 产品 (2分钟)

1. 访问 https://creem.io/dashboard/products
2. 点击 **"Add Product"**
3. 填写信息：
   ```
   名称: 完整命理报告
   描述: 解锁您的完整八字命理分析
   价格: $19.99 (或你想要的价格)
   Success URL: https://your-domain.com/payment/success
   ```
4. 保存后，复制 **Product ID** (格式: `prod_xxxxx`)

### 步骤 2: 获取 API 密钥 (1分钟)

1. 访问 https://creem.io/dashboard/developers
2. 复制你的密钥：
   - **Test API Key**: `creem_test_xxxxx`
   - **Live API Key**: `creem_live_xxxxx`

### 步骤 3: 配置环境变量 (2分钟)

```bash
# 复制环境变量模板
cp env.example .env.local

# 编辑 .env.local
nano .env.local
```

填入以下内容：

```env
# Creem 配置
CREEM_API_KEY_TEST=creem_test_你的测试密钥
CREEM_API_KEY=creem_live_你的生产密钥
CREEM_PRODUCT_ID=prod_你的产品ID
CREEM_MODE=test

# Supabase 配置 (已有的保持不变)
NEXT_PUBLIC_SUPABASE_URL=你的supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key

# Gemini API (已有的保持不变)
GEMINI_API_KEY=你的gemini_key

# 应用 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 步骤 4: 运行数据库迁移 (2分钟)

打开 Supabase SQL Editor：

1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧 **"SQL Editor"**
4. 点击 **"New query"**
5. 复制粘贴文件内容: `supabase/migrations/005_add_creem_payment_fields.sql`
6. 点击 **"Run"**

验证：
```sql
-- 检查表结构是否正确
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments'
ORDER BY ordinal_position;
```

应该看到包含 `checkout_id`, `order_id`, `customer_id`, `metadata` 等字段。

### 步骤 5: 启动应用 (3分钟)

```bash
# 安装依赖（如果还没有）
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看应用。

## ✅ 快速测试

### 本地测试（不需要 webhook）

1. **登录应用**
   - 访问 http://localhost:3000/auth
   - 创建账户或登录

2. **生成预览报告**
   - 访问 http://localhost:3000/generate
   - 填写出生信息
   - 等待报告生成

3. **尝试支付**
   - 在报告页面点击 "解锁完整报告"
   - 应该跳转到 Creem 支付页面
   - 在测试模式下完成支付

4. **验证结果**
   - 支付后应该跳转回 /payment/success
   - 查看 dashboard 确认报告已解锁

## 🔧 配置 Webhook（可选，用于自动化）

### 使用 ngrok 进行本地测试

```bash
# 安装 ngrok
npm install -g ngrok

# 启动 ngrok（在新终端）
ngrok http 3000
```

复制 ngrok URL (如: `https://1234-abc.ngrok.io`)

### 在 Creem 中配置

1. 访问 https://creem.io/dashboard/developers
2. 在 **Test Webhooks** 部分
3. 添加 webhook URL:
   ```
   https://your-ngrok-url.ngrok.io/api/payments/webhook
   ```
4. 保存

### 测试 Webhook

1. 在 Creem Dashboard 找到一个测试支付
2. 点击 **"Resend Webhook"**
3. 查看终端日志，应该看到：
   ```
   [Webhook] Received webhook request
   [Webhook] Event type: payment.success
   ```

## 🐛 常见问题快速解决

### 问题 1: "Payment system not configured"

**原因**: 环境变量未正确配置

**解决**:
```bash
# 检查环境变量
cat .env.local | grep CREEM

# 确保包含：
# CREEM_API_KEY_TEST=creem_test_xxxxx
# CREEM_PRODUCT_ID=prod_xxxxx
# CREEM_MODE=test
```

### 问题 2: API 路由返回 503

**原因**: Next.js 配置问题

**解决**:
```bash
# 检查 next.config.ts
cat next.config.ts | grep output

# 确保 output: 'export' 这行被注释掉
# // output: 'export',
```

### 问题 3: 数据库错误

**原因**: 迁移未运行

**解决**:
```sql
-- 在 Supabase SQL Editor 中运行
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'payments';

-- 如果没有返回结果，重新运行迁移脚本
```

### 问题 4: Creem 返回 401 错误

**原因**: API Key 不正确或已过期

**解决**:
1. 访问 Creem Dashboard
2. 重新生成 API Key
3. 更新 `.env.local`
4. 重启开发服务器

## 📊 验证清单

部署前确认：

- [ ] `.env.local` 已正确配置
- [ ] 数据库迁移已运行
- [ ] 可以创建预览报告
- [ ] 点击"解锁"按钮跳转到 Creem
- [ ] Creem 页面显示正确的产品和价格
- [ ] 完成测试支付后正确返回
- [ ] 报告状态更新为"已付费"
- [ ] 可以查看完整报告

## 🚀 部署到生产环境

### Vercel 部署

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Add Creem payment integration"
   git push
   ```

2. **在 Vercel 配置环境变量**
   - 访问 Vercel Dashboard
   - 选择你的项目
   - Settings > Environment Variables
   - 添加所有 `.env.local` 中的变量
   - **重要**: 将 `CREEM_MODE` 改为 `live`
   - 使用 `CREEM_API_KEY` (live key)

3. **配置生产 Webhook**
   - 在 Creem Dashboard
   - 添加 **Live Webhook**:
     ```
     https://your-domain.vercel.app/api/payments/webhook
     ```

4. **测试生产环境**
   - 使用真实支付方式测试
   - 验证完整流程
   - 立即退款测试支付

## 💡 最佳实践

### 开发环境
```env
CREEM_MODE=test
CREEM_API_KEY=creem_test_xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 预发布环境
```env
CREEM_MODE=test
CREEM_API_KEY=creem_test_xxxxx
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
```

### 生产环境
```env
CREEM_MODE=live
CREEM_API_KEY=creem_live_xxxxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 📞 获取帮助

### 文档
- **完整集成指南**: `CREEM_INTEGRATION_GUIDE.md`
- **测试指南**: `CREEM_TESTING_GUIDE.md`
- **Creem 官方文档**: https://docs.creem.io

### 调试
```bash
# 查看日志
npm run dev

# 在终端中搜索关键字：
# [Payment] - 支付相关
# [Webhook] - Webhook 相关
# [Creem] - API 调用相关
```

### 联系支持
- **Creem Support**: support@creem.io
- **项目 Issues**: GitHub Issues

## 🎉 完成！

恭喜！你已经完成了 Creem 支付集成的快速配置。

**接下来：**
1. 📖 阅读 `CREEM_INTEGRATION_GUIDE.md` 了解更多细节
2. 🧪 查看 `CREEM_TESTING_GUIDE.md` 进行全面测试
3. 🚀 部署到生产环境

**需要更多功能？**
- 订阅模式
- 批量折扣
- 推荐奖励
- 多币种支持

查看 Creem 文档了解更多高级功能！

