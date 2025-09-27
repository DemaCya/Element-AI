# 本地开发 Webhook 测试指南

## 🚫 问题说明

**localhost 无法接收 webhook**，因为：
- Creem 无法访问 `http://localhost:3000`
- 需要 HTTPS 支持
- 需要从互联网可访问的 URL

## 🛠️ 解决方案：使用 ngrok

### 1. 安装 ngrok

#### 方法 A：使用 Homebrew（推荐）
```bash
brew install ngrok/ngrok/ngrok
```

#### 方法 B：直接下载
1. 访问 [https://ngrok.com/download](https://ngrok.com/download)
2. 下载 macOS 版本
3. 解压到 `/usr/local/bin/` 或添加到 PATH

#### 方法 C：使用 npm
```bash
npm install -g ngrok
```

### 2. 注册 ngrok 账户（可选但推荐）

```bash
# 注册后获取 authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### 3. 启动开发环境

#### 终端 1：启动 Next.js
```bash
npm run dev
```

#### 终端 2：启动 ngrok
```bash
ngrok http 3000
```

### 4. 获取公网 URL

ngrok 会显示类似这样的信息：
```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

**重要**：复制 `https://abc123.ngrok.io` 这个 URL

### 5. 配置 Creem Webhook

在 Creem Dashboard 中：
- **Webhook Name**: `Cosmic Destiny AI Webhook`
- **Webhook URL**: `https://abc123.ngrok.io/api/webhooks/creem`

### 6. 测试支付流程

1. 访问您的应用：`https://abc123.ngrok.io`
2. 创建报告并尝试支付
3. 查看 ngrok 的 Web Interface：`http://127.0.0.1:4040`
4. 检查 webhook 请求和响应

## 🔧 其他隧道服务

### localtunnel
```bash
npx localtunnel --port 3000
```

### serveo
```bash
ssh -R 80:localhost:3000 serveo.net
```

## 📊 监控和调试

### ngrok Web Interface
访问 `http://127.0.0.1:4040` 查看：
- 所有 HTTP 请求
- 请求/响应详情
- 重放请求功能

### 服务器日志
```bash
# 在 Next.js 终端中查看日志
npm run dev
```

### 数据库检查
```sql
-- 检查支付记录
SELECT * FROM payments ORDER BY created_at DESC;

-- 检查结账会话
SELECT * FROM checkout_sessions ORDER BY created_at DESC;

-- 检查报告状态
SELECT id, is_paid, payment_id FROM user_reports ORDER BY created_at DESC;
```

## ⚠️ 注意事项

### ngrok 限制
- **免费版**：每次重启 URL 变化
- **付费版**：固定域名，更多功能
- **并发连接**：免费版有限制

### 开发建议
1. **保持 ngrok 运行**：开发期间不要关闭
2. **更新 webhook URL**：如果 ngrok URL 变化
3. **使用测试模式**：Creem 测试模式不会产生真实费用
4. **检查日志**：及时发现问题

## 🚀 生产环境部署

### Vercel（推荐）
```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel

# 设置环境变量
vercel env add CREEM_API_KEY
vercel env add CREEM_WEBHOOK_SECRET
vercel env add CREEM_PRODUCT_ID
```

### 其他平台
- **Netlify**
- **Railway**
- **Heroku**
- **DigitalOcean App Platform**

## 🔍 故障排除

### 常见问题

1. **ngrok 连接失败**
   ```bash
   # 检查网络连接
   ping ngrok.com
   
   # 重启 ngrok
   ngrok http 3000
   ```

2. **Webhook 未收到**
   - 检查 ngrok URL 是否正确
   - 确认 HTTPS 支持
   - 查看 ngrok Web Interface

3. **支付成功但报告未解锁**
   - 检查 webhook 处理逻辑
   - 查看服务器日志
   - 验证数据库更新

### 调试命令

```bash
# 检查端口占用
lsof -i :3000

# 检查 ngrok 状态
ngrok status

# 查看详细日志
ngrok http 3000 --log stdout
```

## 📝 总结

1. **开发阶段**：使用 ngrok 暴露 localhost
2. **测试支付**：使用 Creem 测试模式
3. **生产部署**：使用 Vercel 等平台
4. **监控调试**：使用 ngrok Web Interface

这样您就可以在本地开发并测试完整的支付流程了！
