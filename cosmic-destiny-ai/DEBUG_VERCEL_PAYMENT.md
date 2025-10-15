# 🚀 Vercel 部署环境支付问题调试

## 在 Vercel 上调试与本地完全不同！

---

## 🎯 步骤 1: 检查 Vercel 环境变量（最重要！）

### 1.1 访问 Vercel Dashboard

1. 登录 https://vercel.com
2. 选择你的项目
3. 点击 **"Settings"** 标签
4. 点击左侧 **"Environment Variables"**

### 1.2 确认必须设置的变量

**必需的 Creem 变量**:
```
CREEM_API_KEY_TEST       值: creem_test_xxxxx
CREEM_API_KEY            值: creem_live_xxxxx  (生产环境用)
CREEM_PRODUCT_ID         值: prod_xxxxx
CREEM_MODE               值: test (或 live)
NEXT_PUBLIC_APP_URL      值: https://your-domain.vercel.app
```

**必需的其他变量**:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
```

⚠️ **重要**: 
- 以 `NEXT_PUBLIC_` 开头的变量要同时在 **Production**, **Preview**, 和 **Development** 环境中设置
- 其他变量也要在所有环境中设置

### 1.3 重新部署（必须！）

环境变量修改后，**必须重新部署**才能生效：

1. 点击 **"Deployments"** 标签
2. 找到最新的部署
3. 点击右侧 **"..."** → **"Redeploy"**
4. 或者，直接 push 一个新 commit 触发部署

---

## 🔍 步骤 2: 使用在线测试 API

访问你的测试 API（我已经创建好了）：

```
https://your-domain.vercel.app/api/payments/test-config
```

这个 API 会显示：
- ✅ 哪些环境变量已设置
- ✅ API Key 格式是否正确
- ✅ Product ID 格式是否正确
- ✅ **实际测试 Creem API 连接**
- ✅ 给出具体的错误提示

**示例**:
```json
{
  "overall_status": "✅ 配置正确，支付系统可用",
  "checks": {
    "env_vars": {
      "CREEM_API_KEY_EXISTS": true,
      "CREEM_API_KEY_FORMAT": "TEST",
      "CREEM_PRODUCT_ID": "prod_xxxxx",
      "CREEM_PRODUCT_ID_FORMAT": "VALID"
    },
    "creem_api": {
      "status": "SUCCESS ✅",
      "status_code": 200,
      "response": {
        "checkout_id": "ch_xxxxx",
        "checkout_url": "https://..."
      }
    }
  }
}
```

如果显示错误，它会告诉你具体是什么问题！

---

## 📊 步骤 3: 查看 Vercel 实时日志

### 3.1 打开实时日志

1. 在 Vercel Dashboard，点击 **"Deployments"**
2. 点击最新的部署
3. 点击 **"Functions"** 标签
4. 找到 `api/payments/create-checkout`
5. 点击查看实时日志

### 3.2 触发错误并查看日志

1. 在你的网站上点击"解锁完整报告"按钮
2. 立即回到 Vercel 查看日志
3. 查找 `[Payment]` 和 `[Creem]` 相关的日志

**我已经添加了超详细的日志，你会看到**:
```
[Payment] ========== Create Checkout Request ==========
[Payment] User authenticated: xxxxx
[Payment] Report found: { ... }
[Payment] Calling Creem API to create checkout...
[Creem] Creating checkout for report: xxx
```

如果有错误，日志会显示具体原因！

---

## 🐛 常见 Vercel 部署问题

### 问题 1: 环境变量未设置

**症状**: 
- 测试 API 显示 `CREEM_API_KEY_EXISTS: false`
- 日志显示 "API key not configured"

**解决**:
1. 在 Vercel Dashboard → Settings → Environment Variables 添加变量
2. 确保变量名拼写正确（区分大小写）
3. **重新部署**

---

### 问题 2: 环境变量设置了但不生效

**症状**: 
- 变量在 Vercel Dashboard 可以看到
- 但测试 API 显示变量不存在

**原因**: 
- 添加环境变量后**没有重新部署**
- 或者只在某个环境（如 Production）设置，但访问的是 Preview 环境

**解决**:
1. 确保变量在 **所有环境** 中都设置了
2. **必须重新部署**：Deployments → 最新部署 → Redeploy
3. 等待部署完成（通常 1-2 分钟）
4. 刷新页面重试

---

### 问题 3: API Key 或 Product ID 错误

**症状**:
- 测试 API 显示 `"status": "FAILED ❌"`
- `status_code: 401` 或 `404`

**解决**:

**如果是 401**:
1. 访问 https://creem.io/dashboard/developers
2. **重新复制** API Key（确保复制完整，包括前缀 `creem_test_` 或 `creem_live_`）
3. 更新 Vercel 环境变量
4. 重新部署

**如果是 404**:
1. 访问 https://creem.io/dashboard/products
2. 确认产品存在且已创建
3. 点击 "..." → "Copy ID"
4. 更新 Vercel 环境变量中的 `CREEM_PRODUCT_ID`
5. 重新部署

---

### 问题 4: 测试环境 vs 生产环境混淆

**重要**: Creem 有两个环境！

**测试环境** (开发时用):
- API Key: `creem_test_xxxxx`
- 模式: `CREEM_MODE=test`
- 支付不会真实扣款
- 可以用测试卡号完成支付

**生产环境** (上线后用):
- API Key: `creem_live_xxxxx`
- 模式: `CREEM_MODE=live`
- 会真实扣款

**建议配置**:
```
# 在 Vercel 的 Preview 和 Development 环境
CREEM_API_KEY_TEST=creem_test_xxxxx
CREEM_MODE=test

# 在 Vercel 的 Production 环境
CREEM_API_KEY=creem_live_xxxxx  (如果已准备好生产环境)
CREEM_MODE=live                  (如果已准备好生产环境)
```

---

## ✅ 快速诊断流程（Vercel 专用）

```
1. 访问测试 API
   https://your-domain.vercel.app/api/payments/test-config
   
2. 查看 overall_status
   ├─ ✅ "配置正确" 
   │   → 问题可能在用户认证或报告数据
   │   → 查看 Vercel 函数日志
   │
   └─ ❌ "配置有问题"
       → 查看 suggestions 数组
       → 修复 Vercel 环境变量
       → 重新部署
       → 再次测试

3. 查看浏览器 Console（F12）
   点击"解锁报告"，查看红色错误
   
4. 查看 Vercel 函数日志
   Vercel Dashboard → Deployments → 最新部署 → Functions
   找到 create-checkout 的日志
```

---

## 🎯 Vercel 专用检查清单

在 Vercel Dashboard 确认：

### Environment Variables 页面
- [ ] `CREEM_API_KEY_TEST` 或 `CREEM_API_KEY` 已设置
- [ ] `CREEM_PRODUCT_ID` 已设置且以 `prod_` 开头
- [ ] `CREEM_MODE` 设置为 `test` 或 `live`
- [ ] `NEXT_PUBLIC_APP_URL` 设置为你的域名
- [ ] 所有 Supabase 变量已设置
- [ ] 所有变量在 **Production, Preview, Development** 三个环境都设置了

### Deployments 页面
- [ ] 最新的部署状态是 **"Ready"**（绿色）
- [ ] 部署时间在你修改环境变量**之后**
- [ ] 没有构建错误

### 测试
- [ ] 访问 `/api/payments/test-config` 返回 `overall_status: "✅ 配置正确"`
- [ ] 浏览器可以正常访问网站
- [ ] 用户可以登录

---

## 💡 最佳实践

### 开发流程
```
1. 本地开发
   ├─ 使用 .env.local
   ├─ CREEM_MODE=test
   └─ 测试支付功能

2. 推送到 Vercel Preview
   ├─ 在 Vercel 设置测试环境变量
   ├─ CREEM_MODE=test
   └─ 验证功能正常

3. 发布到 Production
   ├─ 确认要使用生产 API Key
   ├─ CREEM_MODE=live
   ├─ 更新 Webhook URL 到生产域名
   └─ 进行真实支付测试（小额）
```

---

## 🔗 相关链接

- **测试 API**: `https://your-domain.vercel.app/api/payments/test-config`
- **Vercel Dashboard**: https://vercel.com
- **Creem Dashboard**: https://creem.io/dashboard
- **Creem API Docs**: https://docs.creem.io

---

## 📱 移动设备调试

如果在手机上测试，可以：

1. **安装 Eruda 调试工具**（临时）
   在 `src/app/layout.tsx` 的 `<head>` 中添加：
   ```tsx
   {process.env.NODE_ENV === 'development' && (
     <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
     <script>eruda.init();</script>
   )}
   ```

2. **使用 Vercel 日志**
   最可靠的方式，所有错误都会记录

---

## ⚡ 快速修复（90% 的情况）

```
1. 在 Vercel Dashboard 检查环境变量
   → Settings → Environment Variables
   → 确认 CREEM_API_KEY_TEST 和 CREEM_PRODUCT_ID 存在

2. 如果没有或有错，修改/添加

3. 重新部署
   → Deployments → 最新部署 → Redeploy
   
4. 等待部署完成（1-2分钟）

5. 访问测试 API 验证
   → https://your-domain.vercel.app/api/payments/test-config

6. 如果显示 ✅，刷新网站重试支付
```

---

## 🆘 如果还是失败

请提供这些信息：

1. **测试 API 的完整 JSON 响应**
   ```
   https://your-domain.vercel.app/api/payments/test-config
   ```

2. **Vercel 环境变量截图**
   Settings → Environment Variables
   （隐藏敏感信息）

3. **Vercel 函数日志**
   Deployments → Functions → create-checkout
   包含 `[Payment]` 的所有日志

4. **浏览器 Console 错误**
   F12 → Console 标签
   点击解锁按钮后的红色错误

5. **你的 Vercel 域名**
   这样我可以帮你测试

---

## 🎉 成功的标志

当一切正常时：

1. ✅ 测试 API 返回：
   ```json
   {
     "overall_status": "✅ 配置正确，支付系统可用",
     "checks": {
       "creem_api": {
         "status": "SUCCESS ✅"
       }
     }
   }
   ```

2. ✅ 点击"解锁报告"后，页面跳转到：
   ```
   https://app.creem.io/checkout/ch_xxxxx
   ```

3. ✅ Vercel 日志显示：
   ```
   [Payment] Checkout created successfully
   [Creem] Checkout created: ch_xxxxx
   ```

现在就去检查你的 Vercel 环境变量吧！🚀

