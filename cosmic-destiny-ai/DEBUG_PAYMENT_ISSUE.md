# 支付问题调试指南

## 问题描述
点击"解锁完整报告"按钮后，出现弹窗：
```
Failed to start payment process. Please try again.
```
没有跳转到 Creem 支付页面。

---

## 快速诊断步骤

### 步骤 1: 检查浏览器控制台错误

1. 打开浏览器开发者工具（F12 或 Cmd+Option+I）
2. 切换到 **Console** 标签
3. 点击"解锁完整报告"按钮
4. 查看红色错误信息

**请复制所有错误信息**，特别注意：
- `[Report] Error creating checkout:` 后面的错误
- 任何 `fetch failed` 或 `500` 错误
- 任何 API 相关的错误

---

### 步骤 2: 检查 Network 请求

1. 在开发者工具切换到 **Network** 标签
2. 点击"解锁完整报告"按钮
3. 查找 `create-checkout` 请求
4. 点击该请求，查看：
   - **Status**: 应该是 200，如果是 400/401/500 说明有问题
   - **Response**: 查看返回的错误信息

---

### 步骤 3: 检查服务器日志

在运行 `npm run dev` 的终端中查找：

```
[Creem] API key not configured
[Creem] Product ID not configured
[Creem] API error: 401
[Creem] API error: 404
[Payment] Report not found
[Payment] Unauthorized
```

**请复制所有 `[Creem]` 和 `[Payment]` 相关的日志**

---

### 步骤 4: 验证环境变量

在项目根目录执行：

```bash
# 方法 1: 查看 .env.local 文件
cat .env.local | grep CREEM

# 方法 2: 通过 Node.js 检查
node -e "console.log(require('dotenv').config({path: '.env.local'})); console.log(process.env.CREEM_API_KEY)"
```

**期望输出**：
```
CREEM_API_KEY_TEST=creem_test_xxxxx
CREEM_API_KEY=creem_live_xxxxx
CREEM_PRODUCT_ID=prod_xxxxx
CREEM_MODE=test
```

⚠️ **常见错误**：
- 环境变量名拼写错误
- 值为空或只有占位符
- 文件保存在错误位置（应该是项目根目录的 `.env.local`）

---

### 步骤 5: 测试 API 端点

创建测试脚本检查配置：

```bash
# 在项目根目录创建 test-payment-config.js
cat > test-payment-config.js << 'EOF'
// 加载环境变量
require('dotenv').config({ path: '.env.local' })

console.log('=== Creem Configuration Check ===\n')

const checks = [
  { name: 'CREEM_API_KEY', value: process.env.CREEM_API_KEY },
  { name: 'CREEM_API_KEY_TEST', value: process.env.CREEM_API_KEY_TEST },
  { name: 'CREEM_PRODUCT_ID', value: process.env.CREEM_PRODUCT_ID },
  { name: 'CREEM_MODE', value: process.env.CREEM_MODE },
  { name: 'NEXT_PUBLIC_APP_URL', value: process.env.NEXT_PUBLIC_APP_URL },
]

let hasIssues = false

checks.forEach(check => {
  const status = check.value && check.value.length > 0 && !check.value.includes('your_') ? '✅' : '❌'
  console.log(`${status} ${check.name}: ${check.value ? (check.value.length > 30 ? check.value.substring(0, 30) + '...' : check.value) : 'NOT SET'}`)
  
  if (status === '❌') {
    hasIssues = true
    console.log(`   ⚠️  Please set ${check.name} in .env.local\n`)
  }
})

console.log('\n=== Next.js Environment Check ===\n')

// 检查使用的 API Key
const apiKey = process.env.CREEM_API_KEY || process.env.CREEM_API_KEY_TEST
if (apiKey) {
  const isTest = apiKey.startsWith('creem_test_')
  const isLive = apiKey.startsWith('creem_live_')
  
  if (isTest) {
    console.log('✅ Using TEST mode API key')
  } else if (isLive) {
    console.log('⚠️  Using LIVE mode API key (make sure this is intentional)')
  } else {
    console.log('❌ API key format is incorrect (should start with creem_test_ or creem_live_)')
    hasIssues = true
  }
} else {
  console.log('❌ No API key found')
  hasIssues = true
}

console.log('\n=== Summary ===\n')
if (hasIssues) {
  console.log('❌ Configuration has issues. Please fix the problems above.')
  process.exit(1)
} else {
  console.log('✅ Configuration looks good!')
  process.exit(0)
}
EOF

# 运行测试
node test-payment-config.js
```

---

## 常见问题及解决方案

### 问题 1: 环境变量未加载

**症状**: 服务器日志显示 `API key not configured`

**解决方案**:
```bash
# 1. 确认 .env.local 存在
ls -la .env.local

# 2. 重启开发服务器（重要！）
# 按 Ctrl+C 停止
npm run dev

# 3. 清除 Next.js 缓存
rm -rf .next
npm run dev
```

---

### 问题 2: API Key 格式错误

**症状**: Creem API 返回 401 错误

**检查**:
- 测试密钥应该以 `creem_test_` 开头
- 生产密钥应该以 `creem_live_` 开头
- 从 Creem Dashboard 重新复制密钥

---

### 问题 3: Product ID 错误

**症状**: Creem API 返回 404 错误

**解决方案**:
1. 访问 https://creem.io/dashboard/products
2. 确认产品已创建
3. 点击产品的 "..." 菜单
4. 选择 "Copy ID"
5. Product ID 格式应该是 `prod_xxxxx`

---

### 问题 4: 报告未找到或未授权

**症状**: 返回 404 或 401 错误

**检查**:
1. 确认用户已登录
2. 确认报告存在于数据库
3. 确认报告属于当前登录用户

---

### 问题 5: CORS 或网络错误

**症状**: `fetch failed` 或 `Network error`

**解决方案**:
1. 检查网络连接
2. 确认可以访问 https://api.creem.io
3. 检查防火墙设置

---

## 详细调试命令

### 1. 实时查看服务器日志并过滤支付相关

```bash
# 在新终端运行
npm run dev 2>&1 | grep -E "\[Creem\]|\[Payment\]|\[Webhook\]"
```

### 2. 测试 Creem API 连接

```bash
# 测试 API Key 是否有效
curl -X POST https://api.creem.io/v1/checkouts \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "YOUR_PRODUCT_ID_HERE"}'
```

**期望输出**: 应该返回 checkout_url

---

## 下一步

请按顺序执行以上步骤，并提供：

1. ✅ 浏览器控制台的完整错误信息
2. ✅ 服务器终端的日志（包含 [Creem] 或 [Payment] 的行）
3. ✅ `test-payment-config.js` 的输出
4. ✅ Network 标签中 `create-checkout` 请求的 Response

有了这些信息，我就能准确定位问题了！

---

## 快速修复提示

如果你急于解决，最快的方法：

```bash
# 1. 停止开发服务器 (Ctrl+C)

# 2. 清除缓存
rm -rf .next

# 3. 确认环境变量
cat .env.local | grep CREEM

# 4. 重启
npm run dev

# 5. 在浏览器打开 Console，再次测试
```

80% 的问题都是环境变量未正确加载导致的！

