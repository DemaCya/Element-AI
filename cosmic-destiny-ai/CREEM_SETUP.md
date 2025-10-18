# Creem 支付配置指南 - MVP 版本

> 5分钟完成配置，让用户可以支付并自动解锁报告

## 📋 你需要什么

1. **Creem 账户**: https://creem.io
2. **Supabase 项目**: 已配置
3. **10分钟时间**

---

## 🚀 配置步骤

### 1. 在 Creem 创建产品（2分钟）

1. 访问 https://creem.io/dashboard/products
2. 点击 **"Add Product"**
3. 填写：
   - **Name**: 完整命理报告
   - **Price**: $19.99 (或任意价格)
   - **Success URL**: `https://your-domain.com/payment/success`
4. 保存后复制 **Product ID** (格式: `prod_xxxxx`)

### 2. 获取 API 密钥（1分钟）

1. 访问 https://creem.io/dashboard/developers
2. 复制：
   - **Test API Key**: `creem_test_xxxxx`
   - **Live API Key**: `creem_live_xxxxx`

### 3. 配置环境变量（2分钟）

创建 `.env.local` 文件：

```bash
# Creem 配置
CREEM_API_KEY_TEST=creem_test_你的测试密钥
CREEM_API_KEY=creem_live_你的生产密钥
CREEM_PRODUCT_ID=prod_你的产品ID
CREEM_MODE=test

# Supabase (保持现有的)
NEXT_PUBLIC_SUPABASE_URL=你的supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key

# Gemini (保持现有的)
GEMINI_API_KEY=你的gemini_key

# 应用URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 数据库迁移（2分钟）

在 Supabase SQL Editor 中执行：

```sql
-- 在 payments 表中添加必要字段
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS checkout_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS order_id TEXT;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_payments_checkout_id ON payments(checkout_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
```

### 5. 启动测试（1分钟）

```bash
npm install
npm run dev
```

---

## ✅ 测试支付流程

1. **登录应用**: http://localhost:3000/auth
2. **生成报告**: 填写出生信息，生成预览报告
3. **点击解锁**: 在报告页面点击"解锁完整报告"
4. **完成支付**: 在 Creem 页面完成测试支付
5. **查看结果**: 返回后，报告应该已解锁

---

## 🔧 配置 Webhook（可选，推荐）

### 本地测试（使用 ngrok）

```bash
# 安装 ngrok
npm install -g ngrok

# 启动 ngrok
ngrok http 3000

# 复制 URL (如: https://xxxx.ngrok.io)
```

### 在 Creem 配置

1. 访问 https://creem.io/dashboard/developers
2. 在 **Test Webhooks** 添加:
   ```
   https://your-ngrok-url.ngrok.io/api/payments/webhook
   ```
3. 保存

### 测试 Webhook

完成一次支付后，webhook 应该自动：
- ✅ 更新支付状态为 "completed"
- ✅ 标记报告为 is_paid = true
- ✅ 生成完整报告内容

---

## 📊 工作原理

```
用户点击"解锁报告"
    ↓
重定向到 Creem 支付页面
    ↓
用户完成支付
    ↓
Creem 发送 Webhook 到你的服务器
    ↓
自动解锁报告
    ↓
用户看到完整报告 ✨
```

---

## 🐛 常见问题

### Q: 点击解锁按钮没反应？
**A:** 检查浏览器控制台是否有错误，确认环境变量已配置。

### Q: Creem 返回 401 错误？
**A:** API Key 不正确，重新检查 `.env.local` 中的 `CREEM_API_KEY_TEST`。

### Q: 支付成功但报告没解锁？
**A:** 检查：
1. Webhook URL 是否配置正确
2. 查看服务器日志是否有 `[Webhook]` 相关错误
3. 在数据库中检查 payments 表状态

### Q: 如何查看日志？
**A:** 在运行 `npm run dev` 的终端中查看：
```
[Creem] - 创建支付相关
[Webhook] - 支付通知处理
```

---

## 🚀 部署到生产环境

### 1. 在 Vercel 配置环境变量

```env
CREEM_MODE=live
CREEM_API_KEY=creem_live_xxxxx  (使用生产密钥)
CREEM_PRODUCT_ID=prod_xxxxx
NEXT_PUBLIC_APP_URL=https://your-domain.com
# ... 其他变量
```

### 2. 配置生产 Webhook

在 Creem Dashboard 添加 **Live Webhook**:
```
https://your-domain.com/api/payments/webhook
```

### 3. 测试

完成一次真实支付测试，验证整个流程。

---

## 📁 核心文件说明

```
src/
├── services/
│   └── paymentService.ts          # 创建 Creem checkout
├── app/
│   ├── api/
│   │   └── payments/
│   │       ├── create-checkout/   # API: 创建支付会话
│   │       └── webhook/           # API: 接收支付通知
│   ├── payment/
│   │   ├── success/               # 支付成功页面
│   │   └── cancel/                # 支付取消页面
│   └── report/
│       └── page.tsx               # 报告页面（含支付按钮）
```

---

## ✨ 就这么简单！

配置完成后，你的应用就可以：
- ✅ 接受用户支付
- ✅ 自动识别支付成功
- ✅ 自动解锁完整报告

**需要帮助？** 查看服务器日志或检查 Creem Dashboard。

---

## 🔍 验证清单

部署前确认：

- [ ] 环境变量已配置
- [ ] 数据库迁移已执行
- [ ] 本地测试支付成功
- [ ] Webhook 配置正确
- [ ] 报告自动解锁
- [ ] 生产环境变量已配置

全部完成？恭喜，你的支付系统已就绪！🎉

