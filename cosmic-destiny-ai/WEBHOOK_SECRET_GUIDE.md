# 如何获取 Creem Webhook Secret

## 问题解答

您问的 `CREEM_SECRET_KEY` 实际上应该是 `CREEM_WEBHOOK_SECRET`。根据 Creem 文档，他们使用的是 **webhook secret** 而不是 API secret key。

## 获取 Webhook Secret 的步骤

### 1. 登录 Creem Dashboard
访问 [https://creem.io/dashboard/home](https://creem.io/dashboard/home) 并登录您的账户。

### 2. 导航到 Webhooks 页面
1. 在顶部导航栏中，点击 "Developers" 部分
2. 在左侧菜单中，点击 "Webhooks"

### 3. 创建 Webhook
1. 点击 "Add Webhook" 按钮
2. 填写以下信息：
   - **名称**: Cosmic Destiny AI Webhook
   - **URL**: `https://yourdomain.com/api/webhooks/creem`
   - **事件类型**: 选择 `checkout.completed`
3. 点击 "Save" 保存

### 4. 获取 Webhook Secret
创建 webhook 后，您会看到一个 **Webhook Secret** 字段。这个 secret 通常以 `whsec_` 开头。

### 5. 添加到环境变量
将获取到的 webhook secret 添加到您的 `.env.local` 文件中：

```bash
CREEM_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 重要说明

1. **Webhook Secret 的作用**: 用于验证来自 Creem 的 webhook 请求的真实性，防止恶意请求。

2. **安全性**: Webhook secret 是敏感信息，不要提交到版本控制系统中。

3. **测试环境**: 在测试模式下，您也需要创建 webhook 并获取 secret。

## 验证 Webhook Secret

我们的代码会自动验证 webhook 签名：

```typescript
// 在 src/services/creemService.ts 中
private static verifyWebhookSignature(payload: CreemWebhookEvent, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', this.WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex')
  
  return signature === expectedSignature
}
```

## 故障排除

如果 webhook 验证失败：

1. 检查 `CREEM_WEBHOOK_SECRET` 环境变量是否正确设置
2. 确认 webhook URL 可以正常访问
3. 查看 Creem Dashboard 中的 webhook 日志
4. 检查服务器日志中的错误信息

## 总结

- ❌ 不需要 `CREEM_SECRET_KEY`
- ✅ 需要 `CREEM_WEBHOOK_SECRET`
- 📍 在 Creem Dashboard > Developers > Webhooks 中获取
- 🔒 用于验证 webhook 请求的真实性
