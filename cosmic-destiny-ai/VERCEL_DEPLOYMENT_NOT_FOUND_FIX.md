# Vercel DEPLOYMENT_NOT_FOUND 错误修复

## 🐛 错误现象

部署到 Vercel 时出现 `DEPLOYMENT_NOT_FOUND` 错误。

## 🔍 根本原因

### 1. 代码实际在做什么 vs 应该做什么

**vercel.json 当前配置（为静态导出设计）：**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out",      // ❌ 静态导出的输出目录
  "framework": null,              // ❌ 没有指定框架
  "rewrites": [                   // ❌ SPA 重写规则（静态模式用）
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**next.config.ts 当前配置（SSR 模式）：**
```typescript
const nextConfig: NextConfig = {
  // 没有 output: 'export'
  // 使用默认 SSR 模式
}
```

**问题**：配置不匹配！

- `next.config.ts` 说：我是 SSR 应用，输出到 `.next/` 目录
- `vercel.json` 说：我要在 `out/` 目录找静态文件
- Vercel 说：`out/` 目录不存在或为空 → `DEPLOYMENT_NOT_FOUND`

### 2. 触发错误的条件

当同时满足以下条件时触发：

1. ✅ `next.config.ts` 移除了 `output: 'export'`（SSR 模式）
2. ✅ `vercel.json` 仍然指定 `outputDirectory: "out"`（静态模式）
3. ✅ 构建后的输出在 `.next/` 而不是 `out/`
4. ⚠️ Vercel 在 `out/` 目录找不到文件 → 错误！

### 3. 什么导致了这个错误

**误解**：认为 `vercel.json` 是必需的，且需要明确配置所有内容。

**事实**：
- Next.js 项目在 Vercel 上**不需要** `vercel.json`
- Vercel 会自动检测 Next.js 并使用正确配置
- 手动配置反而可能导致冲突

## ✅ 解决方案

### 方案 1：删除 vercel.json（推荐）⭐

**最简单、最可靠的方法：让 Vercel 自动处理一切**

```bash
# 删除 vercel.json
rm vercel.json

# Vercel 会自动：
# - 检测到 Next.js 项目
# - 使用正确的构建命令
# - 找到正确的输出目录（.next）
# - 设置正确的运行时环境
```

### 方案 2：修正 vercel.json 配置

如果您需要保留 `vercel.json` 进行其他配置：

```json
{
  // ❌ 删除这些静态导出相关的配置
  // "buildCommand": "npm run build",
  // "outputDirectory": "out",
  // "framework": null,
  // "rewrites": [...]
  
  // ✅ 只保留必要的自定义配置（如果有）
  // 例如环境变量、重定向等
}
```

或者完全清空：
```json
{}
```

## 📚 深入理解

### 1. 为什么这个错误存在？它保护你免受什么？

**这个错误存在是为了防止部署空的或无效的内容。**

想象一下如果没有这个错误：
```
Vercel: 好的，我在 out/ 目录找部署文件
Vercel: out/ 是空的，但我还是部署吧
用户访问网站: 空白页面 / 404 错误
```

有了这个错误：
```
Vercel: out/ 目录不存在或为空
Vercel: ❌ DEPLOYMENT_NOT_FOUND - 阻止部署
开发者: 发现配置问题并修复
用户: 看到正常工作的网站 ✅
```

### 2. 正确的心智模型

#### Next.js 的两种输出模式

**静态导出模式（Static Export）：**
```
next.config.ts:
  output: 'export'

构建后:
  out/
    ├── index.html
    ├── dashboard/index.html
    ├── report/index.html
    └── _next/static/...

特点:
  - 纯静态 HTML 文件
  - 可以部署到任何静态服务器
  - 不需要 Node.js 运行时
  - 不支持 API 路由、SSR、动态路由等
```

**SSR 模式（默认）：**
```
next.config.ts:
  (没有 output: 'export')

构建后:
  .next/
    ├── server/
    ├── static/
    └── ... (内部构建产物)

特点:
  - 需要 Node.js 服务器
  - 支持所有 Next.js 特性
  - 动态渲染、API 路由、认证等
  - Vercel 自动处理运行时
```

#### Vercel 的自动检测机制

```
Vercel 部署流程:

1. 检测项目类型
   ├─ 发现 package.json → 检查 framework
   ├─ 发现 next.config.* → 识别为 Next.js
   └─ 读取 Next.js 配置

2. 选择构建策略
   ├─ 如果有 output: 'export' → 静态构建
   ├─ 否则 → SSR 构建
   └─ 除非 vercel.json 覆盖了这些设置

3. 部署
   ├─ 静态: 部署 out/ 目录的文件
   └─ SSR: 部署 .next/ 并设置 serverless 函数
```

**关键点**：`vercel.json` 会**覆盖**自动检测！

### 3. 这如何融入框架设计？

**Next.js 的设计哲学：**
- **约定优于配置**：默认就能工作，不需要复杂配置
- **渐进增强**：从静态到 SSR 到 ISR，根据需求选择
- **零配置部署**：在 Vercel 上开箱即用

**Vercel 的设计哲学：**
- **自动检测**：智能识别项目类型和最佳配置
- **零配置**：大多数项目不需要 vercel.json
- **可覆盖**：如需自定义，vercel.json 优先级最高

**当两者冲突时**：
```
优先级：
vercel.json (手动配置，最高)
  ↓
next.config.ts (项目配置)
  ↓
Vercel 自动检测 (默认，最低)
```

## ⚠️ 未来如何避免

### 1. 需要注意的警告信号

**红旗 🚩：你可能会遇到这个问题如果...**

```typescript
// ❌ 危险组合 1：配置不匹配
next.config.ts:
  (SSR 模式)

vercel.json:
  outputDirectory: "out"  // 🚩 静态模式配置

// ❌ 危险组合 2：多余的配置
vercel.json:
  buildCommand: "..."     // 🚩 Vercel 已经知道如何构建 Next.js
  framework: null         // 🚩 阻止自动检测

// ❌ 危险组合 3：从静态改 SSR 但忘了更新
// 之前：output: 'export'
// 现在：移除了，但 vercel.json 还在
```

**本地测试时的信号：**
```bash
npm run build

# ✅ SSR 模式正常输出
> .next/ 目录被创建
> out/ 目录不存在

# 但 vercel.json 说要找 out/
# → 部署时会失败！
```

### 2. 类似的错误场景

**场景 1：从其他平台迁移到 Vercel**
```
你在其他平台需要：
  vercel.json 指定所有配置

迁移到 Vercel 后：
  忘记删除多余配置 → 冲突！
```

**场景 2：复制粘贴配置**
```
从静态项目复制 vercel.json
  ↓
粘贴到 SSR 项目
  ↓
配置不匹配 → 错误！
```

**场景 3：升级 Next.js 版本**
```
旧版本：需要 vercel.json
新版本：自动检测
旧配置干扰新行为 → 错误！
```

### 3. 代码坏味道（Code Smells）

```json
// 🚩 Smell 1: 在 Next.js 项目中手动指定构建命令
{
  "buildCommand": "next build"  // Vercel 已经知道！
}

// 🚩 Smell 2: 禁用框架检测
{
  "framework": null  // 为什么要禁用自动检测？
}

// 🚩 Smell 3: 静态应用的 SPA 重写规则
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
// 这在 SSR 模式下是反模式！

// 🚩 Smell 4: 输出目录与构建不匹配
{
  "outputDirectory": "out"  // 但 next build 输出到 .next/
}
```

### 4. 检查清单

**部署到 Vercel 前检查：**

```bash
# ✅ 步骤 1: 检查 next.config 输出模式
cat next.config.ts | grep "output"
# 如果有 output: 'export' → 静态模式
# 如果没有 → SSR 模式

# ✅ 步骤 2: 本地构建测试
npm run build
ls -la .next/  # SSR 模式应该存在
ls -la out/    # 静态模式应该存在

# ✅ 步骤 3: 检查 vercel.json
cat vercel.json
# 问自己：
# - 我真的需要这个配置吗？
# - 它与 next.config.ts 匹配吗？
# - 我能删除它让 Vercel 自动检测吗？

# ✅ 步骤 4: 验证输出目录
# vercel.json 中的 outputDirectory 应该匹配实际构建输出
```

## 🎯 不同方法的权衡

### 方法对比

| 方法 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **删除 vercel.json** | • 最简单<br>• 零配置<br>• 自动更新 | • 无法自定义<br>• 适合标准项目 | ⭐⭐⭐⭐⭐ |
| **空 vercel.json `{}`** | • 保留文件<br>• 将来可扩展 | • 文件无意义<br>• 可能困惑 | ⭐⭐⭐⭐ |
| **最小化 vercel.json** | • 只保留必要配置 | • 需要维护<br>• 可能过时 | ⭐⭐⭐ |
| **完整的 vercel.json** | • 完全控制 | • 容易出错<br>• 维护负担大 | ⭐⭐ |

### 使用场景建议

**什么时候删除 vercel.json？**
```
✅ 标准 Next.js 项目
✅ 不需要特殊配置
✅ 使用 Vercel 推荐的默认设置
✅ 想要最简单的部署体验

→ 删除 vercel.json，让 Vercel 自动处理
```

**什么时候保留 vercel.json？**
```
✅ 需要自定义重定向规则
✅ 需要设置特殊的环境变量
✅ 需要配置自定义域名
✅ 需要特殊的 header 或 CORS 设置

→ 保留，但只包含必要的配置
```

**最佳实践示例：**

```json
// ✅ 好的 vercel.json（只有必要的自定义）
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}

// ❌ 不好的 vercel.json（重复 Next.js 的工作）
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
  // 这些都是 Vercel 自动做的！
}
```

## 🔄 迁移路径

### 从静态导出迁移到 SSR

```bash
# 步骤 1: 修改 next.config.ts
# 移除 output: 'export'

# 步骤 2: 删除或更新 vercel.json
rm vercel.json
# 或者清空内容

# 步骤 3: 本地测试
npm run build
npm run start
# 测试所有功能正常

# 步骤 4: 提交并推送
git add .
git commit -m "chore: migrate from static export to SSR"
git push

# 步骤 5: Vercel 自动重新部署
# 等待部署完成并测试
```

### 从 SSR 降级到静态导出

```bash
# 步骤 1: 修改 next.config.ts
# 添加 output: 'export'

# 步骤 2: 创建或更新 vercel.json（可选）
cat > vercel.json << EOF
{
  "outputDirectory": "out"
}
EOF

# 步骤 3: 移除 SSR 特性
# - 移除 API 路由
# - 移除 getServerSideProps
# - 移除动态路由参数

# 步骤 4: 测试
npm run build
# 确认 out/ 目录存在

# 步骤 5: 部署
git push
```

## 📝 总结

### 问题
`DEPLOYMENT_NOT_FOUND` 错误因为 `vercel.json` 指定的 `outputDirectory: "out"` 与实际的 SSR 构建输出（`.next/`）不匹配。

### 原因
从静态导出模式迁移到 SSR 模式时，忘记删除或更新 `vercel.json` 中为静态模式设计的配置。

### 解决
删除 `vercel.json`，让 Vercel 自动检测和配置 Next.js 项目。

### 教训
- Next.js 项目在 Vercel 上通常不需要 `vercel.json`
- `vercel.json` 会覆盖自动检测，可能导致冲突
- 配置要与实际的构建模式匹配
- 越少的配置 = 越少的错误 = 越容易维护

### 记住
```
在 Vercel 上部署 Next.js：
默认 = 最好
自动检测 > 手动配置
约定 > 配置
```

🎉 删除 `vercel.json`，让 Vercel 的智能检测来处理一切！

