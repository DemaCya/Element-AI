# Creem 从测试版转到正式版指南

> 完整指南：如何将 Creem 支付从测试环境切换到生产环境

## 📋 切换前准备清单

在开始切换之前，请确认：

- [ ] 测试环境支付流程已完全测试通过
- [ ] 已创建 Creem 生产账户
- [ ] 已在生产环境创建产品并获得产品ID
- [ ] 已获取生产环境的 API Key (`creem_live_xxx`)
- [ ] 网站已部署到生产环境（Vercel）
- [ ] 生产环境的域名已配置 HTTPS

## 🔄 切换步骤

### 步骤 1: 在 Creem Dashboard 关闭测试模式

1. 登录 [Creem Dashboard](https://creem.io/dashboard)
2. 找到顶部导航栏的 **Test Mode** 按钮
3. **关闭 Test Mode**（点击切换为生产模式）

> ⚠️ **重要**：关闭 Test Mode 后，Dashboard 将显示生产环境的 API Keys 和 Webhooks 设置

### 步骤 2: 获取生产环境凭证

#### 2.1 获取生产环境 API Key

1. 进入 [Developers 页面](https://creem.io/dashboard/developers)
2. 复制 **Live API Key**（格式：`creem_live_xxxxx`）
   - ⚠️ 注意：现在应该显示 Live 模式的密钥，不再是 Test 模式的

#### 2.2 确认或创建生产环境产品

1. 进入 [Products 页面](https://creem.io/dashboard/products)
2. 确认产品已创建，并复制 **Product ID**（格式：`prod_xxxxx`）
3. 确认产品的 Success URL 设置为你的生产域名：
   ```
   https://your-production-domain.com/payment/success
   ```

> 💡 **提示**：如果产品是在测试模式创建的，可能需要在生产模式重新创建。确保产品的价格、名称等设置正确。

### 步骤 3: 配置环境变量

#### 3.1 本地环境变量（可选，仅用于本地测试生产配置）

编辑 `.env.local`：

```env
# 切换到生产模式
CREEM_MODE=live

# 生产环境 API Key（从 Creem Dashboard 复制）
CREEM_API_KEY=creem_live_your_actual_live_key_here

# 保留测试密钥（可选，用于切换回测试模式）
CREEM_API_KEY_TEST=creem_test_your_test_key_here

# 生产环境产品ID
CREEM_PRODUCT_ID=prod_your_production_product_id_here

# 生产环境应用URL
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

#### 3.2 Vercel 环境变量（必需）

1. 进入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 更新以下变量：

   | 变量名 | 新值 | 说明 |
   |--------|------|------|
   | `CREEM_MODE` | `live` | 从 `test` 改为 `live` |
   | `CREEM_API_KEY` | `creem_live_xxx` | 生产环境 API Key |
   | `CREEM_PRODUCT_ID` | `prod_xxx` | 生产环境产品ID |
   | `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` | 生产环境域名 |

   > ⚠️ **注意**：
   > - 确保选择正确的环境（Production）
   > - 可以保留 `CREEM_API_KEY_TEST` 以备将来需要切换回测试模式
   > - 更新后需要重新部署才能生效

5. **重新部署**应用：
   - 方式1：在 Vercel Dashboard 点击 **Redeploy**
   - 方式2：推送代码触发自动部署

### 步骤 4: 配置生产环境 Webhook

1. 确保应用已部署到生产环境（Vercel）
2. 进入 [Creem Dashboard - Developers](https://creem.io/dashboard/developers)
3. 在 **Webhooks** 部分，添加生产环境 Webhook URL：
   ```
   https://your-production-domain.com/api/payments/webhook
   ```
4. 点击 **Save** 保存

> ✅ **验证 Webhook**：
> - Creem 会自动测试 Webhook 端点
> - 可以创建一个测试订单验证 Webhook 是否正常工作
> - 查看 Vercel 日志确认收到 Webhook 请求

### 步骤 5: 验证配置

#### 5.1 使用配置测试接口

访问测试端点（仅在开发环境可用）：
```
https://your-production-domain.com/api/payments/test-config
```

检查返回结果：
- ✅ `CREEM_API_KEY_FORMAT`: 应该是 `LIVE`
- ✅ `CREEM_PRODUCT_ID_FORMAT`: 应该是 `VALID`
- ✅ `creem_api.status`: 应该是 `SUCCESS ✅`

#### 5.2 完整支付流程测试

1. 访问你的生产网站
2. 登录账户
3. 生成一个报告
4. 点击"解锁完整报告"
5. 完成一个真实的小额支付（或使用 Creem 提供的测试卡）
6. 验证：
   - ✅ 支付完成后正确跳转到成功页面
   - ✅ 报告已解锁（`is_paid = true`）
   - ✅ Webhook 正确处理了支付事件（查看 Vercel 日志）

## 🔍 代码自动切换机制

代码已实现自动模式切换，无需修改代码：

### `src/services/paymentService.ts`

```typescript
// 根据 CREEM_MODE 自动选择配置
const IS_TEST_MODE = process.env.CREEM_MODE === 'test'

const CREEM_API_BASE = IS_TEST_MODE 
  ? 'https://test-api.creem.io/v1'  // 测试模式
  : 'https://api.creem.io/v1'        // 生产模式

const CREEM_API_KEY = IS_TEST_MODE 
  ? process.env.CREEM_API_KEY_TEST   // 测试密钥
  : process.env.CREEM_API_KEY        // 生产密钥
```

### 切换逻辑

| CREEM_MODE | API 端点 | API Key 来源 |
|------------|---------|--------------|
| `test` | `test-api.creem.io` | `CREEM_API_KEY_TEST` |
| `live` 或未设置 | `api.creem.io` | `CREEM_API_KEY` |

> ✅ **无需修改代码**：只需更改环境变量 `CREEM_MODE` 即可切换模式

## ⚠️ 注意事项

### 1. API Key 格式验证

生产环境的 API Key 必须：
- ✅ 以 `creem_live_` 开头
- ✅ 长度通常为 40-50 个字符
- ❌ 不能使用测试模式的 `creem_test_` 密钥

### 2. 产品ID一致性

- 确保 `CREEM_PRODUCT_ID` 是生产环境创建的产品ID
- 测试环境和生产环境的产品ID是不同的
- 如果切换模式后支付失败，检查产品ID是否正确

### 3. Webhook 安全性

- 生产环境 Webhook 必须是 HTTPS
- Webhook URL 必须是可公开访问的（Creem 需要能够访问）
- 建议在生产环境实现 Webhook 签名验证（代码中已包含）

### 4. 测试配置接口的问题

⚠️ **发现的问题**：`src/app/api/payments/test-config/route.ts` 中硬编码使用了 `https://api.creem.io`，应该根据模式动态切换。

**建议修复**（可选）：
```typescript
const CREEM_API_BASE = process.env.CREEM_MODE === 'test' 
  ? 'https://test-api.creem.io/v1'
  : 'https://api.creem.io/v1'

// 使用 CREEM_API_BASE 而不是硬编码
const response = await fetch(`${CREEM_API_BASE}/checkouts`, {
  // ...
})
```

> 💡 这个修复是可选的，因为测试配置接口主要用于开发环境调试。

### 5. 切换时机建议

- ✅ 在业务低峰期切换
- ✅ 提前通知用户可能的服务中断
- ✅ 准备回滚方案（保留测试模式配置）
- ✅ 切换后立即测试关键功能

## 🔄 回滚方案

如果需要切换回测试模式：

1. 在 Vercel 环境变量中将 `CREEM_MODE` 改回 `test`
2. 重新部署应用
3. 在 Creem Dashboard 重新开启 Test Mode

## 📊 验证清单

切换完成后，使用此清单验证：

- [ ] Creem Dashboard 已关闭 Test Mode
- [ ] Vercel 环境变量已更新为生产配置
- [ ] 应用已重新部署
- [ ] `/api/payments/test-config` 显示 `LIVE` 模式
- [ ] Creem API 测试调用成功
- [ ] 生产环境 Webhook 已配置
- [ ] 完成一次真实支付测试
- [ ] 支付成功后报告正确解锁
- [ ] Webhook 日志显示正确处理
- [ ] 支付记录正确保存到数据库

## 🆘 问题排查

### 问题1: 支付失败，返回 401 错误

**可能原因**：
- API Key 不正确或已过期
- 使用了测试模式的 API Key 调用生产 API

**解决方案**：
1. 确认 `CREEM_API_KEY` 是 `creem_live_` 开头的生产密钥
2. 确认 `CREEM_MODE=live`
3. 在 Creem Dashboard 重新复制 API Key

### 问题2: 支付失败，返回 404 错误

**可能原因**：
- Product ID 不正确
- 使用了测试环境的产品ID

**解决方案**：
1. 确认 `CREEM_PRODUCT_ID` 是生产环境的产品ID
2. 在 Creem Dashboard 重新复制产品ID

### 问题3: Webhook 未收到支付事件

**可能原因**：
- Webhook URL 未在生产环境注册
- Webhook URL 不可访问
- Creem Dashboard 仍在测试模式

**解决方案**：
1. 确认 Creem Dashboard 已关闭 Test Mode
2. 确认 Webhook URL 已正确配置
3. 使用 curl 测试 Webhook 端点是否可访问：
   ```bash
   curl -X POST https://your-domain.com/api/payments/webhook \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

### 问题4: 支付成功但报告未解锁

**可能原因**：
- Webhook 处理失败
- 数据库连接问题

**解决方案**：
1. 查看 Vercel 日志中的 Webhook 处理记录
2. 确认 Supabase 环境变量已正确设置
3. 检查数据库连接是否正常

## 📚 相关文档

- [Creem 官方文档](./creem.md)
- [Creem 集成指南](./CREEM_INTEGRATION_GUIDE.md)
- [Creem 测试指南](./CREEM_TESTING_GUIDE.md)

## ✅ 切换完成

完成所有步骤后，你的网站已成功切换到 Creem 生产环境！🎉

现在可以：
- ✅ 接收真实支付
- ✅ 处理生产环境订单
- ✅ 通过 Webhook 自动处理支付事件

---

**需要帮助？** 如果遇到问题，请查看 Vercel 日志和 Creem Dashboard 的 Webhook 事件记录。

