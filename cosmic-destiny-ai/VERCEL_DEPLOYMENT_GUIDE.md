# Vercel 部署指南

## 🚀 快速部署到 Vercel

### 1. 登录 Vercel

```bash
vercel login
```

### 2. 部署项目

```bash
vercel
```

第一次部署时会询问一些问题：
- **Set up and deploy?** → Yes
- **Which scope?** → 选择您的账户
- **Link to existing project?** → No
- **What's your project's name?** → cosmic-destiny-ai
- **In which directory is your code located?** → ./

### 3. 设置环境变量

部署完成后，需要设置环境变量：

```bash
# 设置 Supabase 配置
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 设置 Google Gemini API
vercel env add NEXT_PUBLIC_GEMINI_API_KEY

# 设置 Creem 支付配置
vercel env add CREEM_API_KEY
vercel env add CREEM_WEBHOOK_SECRET
vercel env add CREEM_PRODUCT_ID

# 设置应用 URL
vercel env add NEXT_PUBLIC_APP_URL
```

### 4. 重新部署

设置环境变量后，重新部署：

```bash
vercel --prod
```

## 🔧 环境变量配置

### 必需的环境变量

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key

# Creem 支付配置
CREEM_API_KEY=creem_your_api_key
CREEM_WEBHOOK_SECRET=whsec_your_webhook_secret
CREEM_PRODUCT_ID=prod_your_product_id

# 应用 URL（Vercel 会自动设置，但可以手动覆盖）
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 🌐 获取部署 URL

部署成功后，Vercel 会提供：
- **生产 URL**: `https://cosmic-destiny-ai.vercel.app`
- **预览 URL**: `https://cosmic-destiny-ai-git-main.vercel.app`

## 🔗 配置 Creem Webhook

使用 Vercel 提供的 URL 配置 webhook：

1. **登录 Creem Dashboard**
2. **导航到 Developers > Webhooks**
3. **创建 Webhook**：
   - **Name**: `Cosmic Destiny AI Webhook`
   - **URL**: `https://cosmic-destiny-ai.vercel.app/api/webhooks/creem`
   - **Events**: `checkout.completed`

## 🧪 测试支付流程

### 1. 访问部署的应用
```
https://cosmic-destiny-ai.vercel.app
```

### 2. 创建测试报告
- 填写出生信息
- 生成预览报告

### 3. 测试支付
- 点击"立即解锁完整报告"
- 使用 Creem 测试模式支付
- 验证 webhook 是否正常工作

## 📊 监控和调试

### Vercel Dashboard
- 访问 [vercel.com/dashboard](https://vercel.com/dashboard)
- 查看部署日志
- 监控函数执行

### 查看日志
```bash
# 查看实时日志
vercel logs

# 查看特定部署的日志
vercel logs [deployment-url]
```

### 检查环境变量
```bash
# 查看所有环境变量
vercel env ls

# 查看特定环境变量
vercel env pull .env.local
```

## 🔄 更新部署

### 自动部署
- 连接 GitHub 仓库
- 每次 push 到 main 分支自动部署

### 手动部署
```bash
# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

## 🛠️ 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 本地测试构建
   npm run build
   
   # 查看详细错误
   vercel logs
   ```

2. **环境变量未生效**
   ```bash
   # 重新部署
   vercel --prod
   
   # 检查环境变量
   vercel env ls
   ```

3. **Webhook 未收到**
   - 检查 Vercel 函数日志
   - 验证 webhook URL 是否正确
   - 确认 HTTPS 支持

### 调试命令

```bash
# 查看项目信息
vercel ls

# 查看部署详情
vercel inspect [deployment-url]

# 下载部署文件
vercel pull
```

## 📝 生产环境优化

### 1. 自定义域名
- 在 Vercel Dashboard 中添加自定义域名
- 更新 `NEXT_PUBLIC_APP_URL` 环境变量

### 2. 性能优化
- 启用 Vercel Analytics
- 配置 CDN 缓存
- 优化图片和静态资源

### 3. 安全配置
- 设置 CORS 策略
- 配置安全头
- 启用 DDoS 保护

## 🎯 下一步

1. **部署到 Vercel** ✅
2. **配置环境变量** ✅
3. **设置 Creem Webhook** ✅
4. **测试支付流程** ✅
5. **监控和优化** ✅

现在您就可以在真实的 HTTPS 环境中测试完整的支付流程了！
