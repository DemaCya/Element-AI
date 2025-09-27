# Creem 支付集成设置指南

## 环境变量配置

在您的 `.env.local` 文件中添加以下环境变量：

```bash
# Supabase 配置（如果还没有的话）
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini API 配置（如果还没有的话）
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key

# Creem 支付配置
CREEM_API_KEY=your_creem_api_key_here
CREEM_WEBHOOK_SECRET=your_webhook_secret_here
CREEM_PRODUCT_ID=prod_your_product_id_here

# 应用 URL（用于支付成功重定向）
NEXT_PUBLIC_APP_URL=http://localhost:3000  # 开发环境
# NEXT_PUBLIC_APP_URL=https://yourdomain.com  # 生产环境

# 可选：时区配置（用于八字计算）
TZ=Asia/Shanghai
```

## 获取 Creem API 密钥

1. 访问 [Creem Dashboard](https://creem.io/dashboard/home)
2. 登录您的账户
3. 在顶部导航栏中，点击 "Developers" 部分
4. 点击眼睛图标显示您的 API 密钥
5. 复制 API 密钥并保存到环境变量中

## 创建产品

1. 在 Creem Dashboard 中，导航到 "Products" 部分
2. 点击 "Create Product"
3. 填写产品信息：
   - **产品名称**: 宇宙命理完整报告
   - **描述**: 深度命理分析报告，包含人格特质、职业指导、感情分析、人生使命等全方位内容
   - **价格**: $19.99 USD
   - **类型**: 一次性支付 (One-time)
4. 保存产品并复制产品 ID
5. 将产品 ID 添加到环境变量 `CREEM_PRODUCT_ID` 中

## 配置 Webhook

1. 在 Creem Dashboard 中，导航到 "Developers" > "Webhooks"
2. 点击 "Add Webhook"
3. 填写 webhook 信息：
   - **名称**: Cosmic Destiny AI Webhook
   - **URL**: `https://yourdomain.com/api/webhooks/creem`
   - **事件类型**: 选择 `checkout.completed`
4. 保存 webhook 配置
5. **重要**: 复制 webhook secret 并添加到环境变量 `CREEM_WEBHOOK_SECRET` 中

## 测试模式

Creem 支持测试模式，您可以使用测试 API 密钥进行开发：

1. 在 Creem Dashboard 中，切换到测试模式
2. 获取测试 API 密钥
3. 使用测试产品 ID
4. 进行测试支付

## 支付流程

1. 用户点击"立即解锁完整报告"按钮
2. 系统调用 `/api/checkout/create` 创建 Creem 结账会话
3. 用户被重定向到 Creem 支付页面
4. 用户完成支付
5. Creem 发送 webhook 到 `/api/webhooks/creem`
6. 系统处理 webhook，更新报告状态为已付费
7. 用户被重定向回报告页面，显示完整内容

## 数据库迁移

运行以下命令应用数据库迁移：

```bash
# 如果使用 Supabase CLI
supabase db push

# 或者直接在 Supabase Dashboard 中运行 SQL
# 文件位置: supabase/migrations/005_add_creem_payment_tables.sql
```

## 故障排除

### 常见问题

1. **API 密钥错误**
   - 检查环境变量是否正确设置
   - 确认使用的是正确的 API 密钥（测试/生产）

2. **Webhook 未收到**
   - 检查 webhook URL 是否正确
   - 确认服务器可以接收 HTTPS 请求
   - 查看 Creem Dashboard 中的 webhook 日志

3. **支付成功但报告未解锁**
   - 检查 webhook 处理逻辑
   - 查看服务器日志中的错误信息
   - 确认数据库表已正确创建

4. **重定向失败**
   - 检查 `NEXT_PUBLIC_APP_URL` 环境变量
   - 确认 success_url 配置正确

### 日志查看

- 服务器日志：查看控制台输出
- Creem Dashboard：查看支付和 webhook 日志
- 数据库：检查 `checkout_sessions` 和 `payments` 表

## 安全注意事项

1. **API 密钥安全**
   - 永远不要在客户端代码中暴露 API 密钥
   - 使用环境变量存储敏感信息
   - 定期轮换 API 密钥

2. **Webhook 验证**
   - 实现 webhook 签名验证
   - 验证请求来源的真实性

3. **数据保护**
   - 使用 HTTPS 传输所有支付相关数据
   - 定期备份支付数据
   - 遵循 PCI DSS 合规要求

## 支持

如果遇到问题，可以：

1. 查看 [Creem 官方文档](https://docs.creem.io)
2. 联系 Creem 技术支持
3. 检查项目 GitHub Issues
