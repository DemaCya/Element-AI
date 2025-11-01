# Creem 生产环境切换检查清单

> 快速参考：从测试模式切换到生产模式的步骤

## ✅ 切换前检查

- [ ] 测试环境支付流程已完全测试
- [ ] 网站已部署到生产环境（Vercel）
- [ ] 生产域名已配置 HTTPS

## 🔄 切换步骤

### 1. Creem Dashboard

- [ ] 登录 [Creem Dashboard](https://creem.io/dashboard)
- [ ] **关闭 Test Mode**（顶部导航栏）
- [ ] 复制 **Live API Key**（格式：`creem_live_xxx`）
  - 位置：[Developers 页面](https://creem.io/dashboard/developers)
- [ ] 确认或创建**生产环境产品**
  - 位置：[Products 页面](https://creem.io/dashboard/products)
- [ ] 复制**生产环境 Product ID**（格式：`prod_xxx`）
- [ ] 确认产品 Success URL 设置为生产域名

### 2. Vercel 环境变量

进入 [Vercel Dashboard](https://vercel.com/dashboard) → 项目 → Settings → Environment Variables

更新以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `CREEM_MODE` | `live` | 从 `test` 改为 `live` |
| `CREEM_API_KEY` | `creem_live_xxx` | 生产环境 API Key |
| `CREEM_PRODUCT_ID` | `prod_xxx` | 生产环境产品ID |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` | 生产域名 |

- [ ] 选择 **Production** 环境
- [ ] 保存后**重新部署**应用

### 3. Webhook 配置

- [ ] 在 Creem Dashboard - Developers 添加生产 Webhook：
  ```
  https://your-production-domain.com/api/payments/webhook
  ```
- [ ] 保存并验证 Webhook

### 4. 验证测试

- [ ] 访问 `/api/payments/test-config` 检查配置
  - `CREEM_API_KEY_FORMAT` 应该是 `LIVE`
  - `CREEM_API_BASE` 应该是 `https://api.creem.io/v1`
  - `creem_api.status` 应该是 `SUCCESS ✅`
- [ ] 完成一次真实支付测试
- [ ] 验证支付成功后报告解锁
- [ ] 检查 Vercel 日志确认 Webhook 正常

## ⚙️ 代码自动切换

代码已支持自动模式切换，**无需修改代码**：

```typescript
// src/services/paymentService.ts
const IS_TEST_MODE = process.env.CREEM_MODE === 'test'
// 自动选择 API 端点和密钥
```

只需更改 `CREEM_MODE` 环境变量即可！

## 🔍 验证清单

切换完成后验证：

- [ ] Creem Dashboard Test Mode 已关闭
- [ ] Vercel 环境变量已更新
- [ ] 应用已重新部署
- [ ] `/api/payments/test-config` 显示 LIVE 模式
- [ ] 完成真实支付测试成功
- [ ] Webhook 正确处理支付事件

## 🆘 常见问题

### 401 错误
→ 检查 API Key 是否为 `creem_live_` 开头

### 404 错误
→ 检查 Product ID 是否为生产环境的产品ID

### Webhook 未收到
→ 检查 Creem Dashboard 是否已关闭 Test Mode

---

**详细文档**：查看 [CREEM_PRODUCTION_MIGRATION.md](./CREEM_PRODUCTION_MIGRATION.md)

