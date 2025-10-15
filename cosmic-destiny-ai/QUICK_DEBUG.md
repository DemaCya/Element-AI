# 🚨 支付失败快速诊断

## 问题：点击"解锁完整报告"出现错误

---

## 🎯 立即执行（按顺序）

### 步骤 1: 运行配置测试脚本 (1分钟)

在项目根目录打开终端，执行：

```bash
node test-payment-config.js
```

**如果出现错误 "dotenv not found"**，先安装：
```bash
npm install dotenv
node test-payment-config.js
```

这会自动检测所有配置问题并给出具体提示！

---

### 步骤 2: 访问测试 API (30秒)

1. 确保开发服务器正在运行：`npm run dev`
2. 在浏览器打开：http://localhost:3000/api/payments/test-config
3. 查看返回的 JSON，找到 `overall_status` 和 `suggestions`

---

### 步骤 3: 查看详细日志 (1分钟)

1. **重启开发服务器**（重要！）：
   ```bash
   # 按 Ctrl+C 停止当前服务器
   rm -rf .next
   npm run dev
   ```

2. **查看启动日志**，确保没有环境变量相关错误

3. **打开浏览器开发者工具**（F12 或 Cmd+Option+I）

4. **切换到 Console 标签**

5. **点击"解锁完整报告"按钮**

6. **立即查看**：
   - **浏览器 Console** 的错误（红色）
   - **服务器终端** 的 `[Payment]` 和 `[Creem]` 日志

---

## 🔍 根据日志定位问题

### 情况 A: 服务器日志显示 "API key not configured"

**原因**: 环境变量未加载

**解决方案**:
```bash
# 1. 检查 .env.local 是否存在
ls -la .env.local

# 2. 查看内容
cat .env.local | grep CREEM

# 3. 如果没有文件，创建它
cp env.example .env.local

# 4. 编辑 .env.local，填入真实的值
# CREEM_API_KEY_TEST=creem_test_xxxxx  (从 Creem Dashboard 复制)
# CREEM_PRODUCT_ID=prod_xxxxx          (从 Creem Dashboard 复制)

# 5. 重启服务器（重要！）
# Ctrl+C 停止，然后：
npm run dev
```

---

### 情况 B: 浏览器 Console 显示 "401 Unauthorized"

**原因**: 用户未登录或 session 过期

**解决方案**:
```bash
# 1. 退出登录
# 2. 重新登录
# 3. 再次尝试解锁报告
```

---

### 情况 C: 服务器日志显示 "Creem API error: 401"

**原因**: API Key 不正确

**解决方案**:
```bash
# 1. 访问 https://creem.io/dashboard/developers
# 2. 重新复制 API Key（确保复制完整）
# 3. 更新 .env.local：
#    CREEM_API_KEY_TEST=creem_test_完整的密钥
# 4. 重启服务器
```

---

### 情况 D: 服务器日志显示 "Creem API error: 404"

**原因**: Product ID 不存在或错误

**解决方案**:
```bash
# 1. 访问 https://creem.io/dashboard/products
# 2. 确认产品已创建
# 3. 点击产品的 "..." 菜单 → "Copy ID"
# 4. 更新 .env.local：
#    CREEM_PRODUCT_ID=prod_你的产品ID
# 5. 重启服务器
```

---

### 情况 E: 服务器日志显示 "Report not found"

**原因**: 报告不存在或不属于当前用户

**解决方案**:
```bash
# 1. 返回首页
# 2. 重新生成一份报告
# 3. 尝试解锁新报告
```

---

## 📋 环境变量检查清单

打开 `.env.local` 文件，确认有以下内容：

```bash
# ✅ Creem 配置 - 必需
CREEM_API_KEY_TEST=creem_test_xxxxx      # 必须以 creem_test_ 开头
CREEM_API_KEY=creem_live_xxxxx           # 可选，生产环境用
CREEM_PRODUCT_ID=prod_xxxxx              # 必须以 prod_ 开头
CREEM_MODE=test                          # test 或 live

# ✅ Supabase 配置 - 必需
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# ✅ Gemini 配置 - 必需
GEMINI_API_KEY=AIzxxx...

# ✅ 应用 URL - 必需
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔧 万能解决方案（90% 的问题）

如果上面的步骤都不行，执行这个：

```bash
# 1. 完全停止服务器
# 按 Ctrl+C

# 2. 清除所有缓存
rm -rf .next
rm -rf node_modules/.cache

# 3. 确认环境变量文件存在且正确
cat .env.local | grep CREEM
# 应该看到 CREEM_API_KEY_TEST 和 CREEM_PRODUCT_ID

# 4. 如果没有看到或值不对，重新配置
nano .env.local  # 或用你喜欢的编辑器
# 粘贴从 Creem Dashboard 复制的真实值

# 5. 重新启动
npm run dev

# 6. 运行测试
node test-payment-config.js

# 7. 如果测试通过，浏览器中再试一次
```

---

## 📞 仍然失败？收集这些信息

如果以上都不行，请收集以下信息：

### 1. 配置测试输出
```bash
node test-payment-config.js > config-test-output.txt
cat config-test-output.txt
```

### 2. API 测试输出
访问 http://localhost:3000/api/payments/test-config
复制整个 JSON 响应

### 3. 服务器日志
```bash
# 重启服务器，然后点击解锁按钮，复制所有带 [Payment] 的日志
npm run dev 2>&1 | tee server-logs.txt
```

### 4. 浏览器 Console 日志
- F12 打开开发者工具
- Console 标签
- 点击解锁按钮
- 右键点击错误 → "Copy all"

### 5. Network 请求详情
- F12 → Network 标签
- 点击解锁按钮
- 找到 `create-checkout` 请求
- 点击 → Response 标签
- 复制响应内容

---

## 💡 最常见的 3 个问题

### 1. 环境变量未加载 (70% 的情况)
**症状**: 日志显示 "API key not configured"
**解决**: 确保 `.env.local` 在项目根目录，并重启服务器

### 2. API Key 复制不完整 (20% 的情况)
**症状**: 日志显示 "401 error"
**解决**: 重新从 Creem Dashboard 复制完整的 API Key

### 3. Product ID 错误 (10% 的情况)
**症状**: 日志显示 "404 error"
**解决**: 确认产品已创建，重新复制 Product ID

---

## ✅ 成功的标志

当配置正确时，你应该看到：

**服务器日志**:
```
[Payment] ========== Create Checkout Request ==========
[Payment] User authenticated: xxxxx
[Payment] Report found: { id: 'xxx', ... }
[Payment] Calling Creem API to create checkout...
[Creem] Creating checkout for report: xxx
[Creem] Checkout created: ch_xxxxx
[Payment] Checkout created successfully
```

**浏览器行为**:
- 点击按钮后，页面跳转到 Creem 支付页面
- URL 类似：https://app.creem.io/checkout/ch_xxxxx

---

## 🎯 快速验证流程

```bash
# 一键检查所有配置
node test-payment-config.js && \
curl http://localhost:3000/api/payments/test-config | json_pp
```

如果两个都显示 ✅，那么配置是正确的，问题可能在其他地方（如用户认证、报告数据等）。

---

有问题随时告诉我你看到的具体错误信息！💪

