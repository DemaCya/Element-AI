# 环境变量配置说明

## 必需的环境变量

### Supabase 配置
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Google Gemini API 配置
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### Creem 支付配置
```bash
CREEM_API_KEY=your_creem_api_key_here
CREEM_WEBHOOK_SECRET=your_webhook_secret_here
CREEM_PRODUCT_ID=prod_your_product_id_here
```

### 应用配置
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000  # 开发环境
# NEXT_PUBLIC_APP_URL=https://yourdomain.com  # 生产环境
```

## 可选的环境变量

### 时区配置（用于八字计算）
```bash
TZ=Asia/Shanghai
```

## 完整的 .env.local 示例

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini API 配置
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key

# Creem 支付配置
CREEM_API_KEY=creem_123456789abcdef
CREEM_WEBHOOK_SECRET=whsec_123456789abcdef
CREEM_PRODUCT_ID=prod_6tW66i0oZM7w1qXReHJrwg

# 应用 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 时区配置
TZ=Asia/Shanghai
```

## 环境变量使用位置

### 在代码中的使用
- `CREEM_API_KEY` - 在 `src/services/creemService.ts` 中用于 Creem API 调用
- `CREEM_WEBHOOK_SECRET` - 在 `src/services/creemService.ts` 中用于 webhook 签名验证
- `CREEM_PRODUCT_ID` - 在 `src/services/creemService.ts` 中定义产品 ID
- `NEXT_PUBLIC_APP_URL` - 在多个文件中用于构建重定向 URL
- `NEXT_PUBLIC_SUPABASE_URL` - 在 Supabase 客户端配置中使用
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 在 Supabase 客户端配置中使用
- `NEXT_PUBLIC_GEMINI_API_KEY` - 在 `src/services/geminiService.ts` 中使用

## 注意事项

1. **安全性**：`CREEM_API_KEY` 和 `CREEM_WEBHOOK_SECRET` 是敏感信息，不要提交到版本控制
2. **前缀**：以 `NEXT_PUBLIC_` 开头的变量可以在客户端代码中访问
3. **生产环境**：确保在生产环境中使用正确的 API 密钥和 URL
4. **测试模式**：Creem 支持测试模式，可以使用测试 API 密钥进行开发

## 获取 API 密钥

### Supabase
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 在 Settings > API 中获取 URL 和 anon key

### Google Gemini
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的 API 密钥

### Creem
1. 访问 [Creem Dashboard](https://creem.io/dashboard/home)
2. 在 Developers 部分获取 API 密钥
3. 创建产品并获取产品 ID
4. 在 Developers > Webhooks 页面创建 webhook 并获取 webhook secret
