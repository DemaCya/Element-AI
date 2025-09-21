# 生产环境配置指南

## 概述
本文档详细说明了将 Cosmic Destiny AI 部署到生产环境所需的配置和步骤。

## 1. 环境变量配置

### 必需的环境变量
```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API Keys（目前使用模拟数据，实际部署时需要添加）
GEMINI_API_KEY=your-gemini-api-key  # Google Gemini API密钥

# 支付配置（如需启用支付功能）
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## 2. 数据库设置

### 执行数据库迁移
按顺序执行以下SQL文件：

1. `/supabase/migrations/001_create_tables.sql` - 创建基础表结构
2. `/supabase/migrations/002_add_is_time_known_input.sql` - 添加时间输入标记
3. `/supabase/migrations/003_separate_preview_and_full_reports.sql` - 分离预览和完整报告
4. `/supabase/migrations/004_add_report_name.sql` - 添加报告名称功能

### 数据库优化建议
- 确保所有索引都已创建
- 启用数据库备份（建议每日备份）
- 配置数据库连接池大小
- 监控查询性能

## 3. 安全配置

### 环境安全
- 确保所有敏感环境变量都通过安全的方式存储（如 Vercel 环境变量）
- 不要在代码中硬编码任何密钥
- 使用 HTTPS 进行所有通信

### 认证安全
- Supabase Auth 已经处理了大部分安全问题
- 确保 RLS（行级安全）策略已正确配置
- 定期审查用户权限

### API 安全
- 实施请求限流（建议每用户每小时最多100次请求）
- 添加 CORS 配置
- 验证所有输入数据

## 4. 性能优化

### 前端优化
- 已启用 Next.js 图片优化
- 使用动态导入减少初始加载时间
- 启用页面预取

### 后端优化
- 实施响应缓存（特别是报告生成）
- 使用数据库连接池
- 优化查询（避免 N+1 问题）

### CDN 配置
```javascript
// next.config.ts 已包含基础CDN配置
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}
```

## 5. 监控和日志

### 推荐的监控工具
- Vercel Analytics（已集成）
- Sentry 错误追踪
- Supabase 内置监控

### 日志配置
```javascript
// 添加结构化日志
const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }))
  },
  error: (message: string, error?: any, meta?: any) => {
    console.error(JSON.stringify({ level: 'error', message, error: error?.message, ...meta, timestamp: new Date().toISOString() }))
  }
}
```

## 6. 部署步骤

### 使用 Vercel 部署（推荐）
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 设置构建命令：`npm run build`
4. 部署

### 手动部署
```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 启动生产服务器
npm start
```

## 7. 备份和恢复

### 数据库备份
- 使用 Supabase 内置备份功能
- 建议每日自动备份
- 定期测试恢复流程

### 代码备份
- 使用 Git 标签标记每个发布版本
- 保持至少3个稳定版本的备份

## 8. 扩展性考虑

### 水平扩展
- 应用已设计为无状态，可以轻松水平扩展
- 使用 Vercel 的自动扩展功能

### 数据库扩展
- 监控数据库性能
- 必要时升级 Supabase 计划
- 考虑读写分离

## 9. 维护计划

### 定期维护任务
- 每周检查错误日志
- 每月更新依赖包
- 每季度进行安全审计
- 定期清理旧数据

### 更新流程
1. 在开发环境测试
2. 部署到预发布环境
3. 进行回归测试
4. 部署到生产环境
5. 监控关键指标

## 10. 故障恢复

### 应急预案
1. 数据库故障：切换到备份数据库
2. API 服务故障：启用降级模式（显示缓存数据）
3. 支付系统故障：临时禁用付费功能

### 联系方式
- 技术支持：[您的联系方式]
- 紧急联系：[紧急联系方式]

## 注意事项

1. **API 密钥**：当前项目使用模拟数据，实际部署前需要：
   - 获取 Google Gemini API 密钥
   - 在相关服务文件中启用真实 API 调用

2. **支付集成**：如需启用支付功能：
   - 完成 Stripe 账户设置
   - 更新支付服务配置
   - 测试支付流程

3. **域名配置**：
   - 配置自定义域名
   - 设置 SSL 证书
   - 更新 Supabase 允许的域名列表

4. **合规性**：
   - 确保隐私政策和服务条款页面已更新
   - 遵守当地数据保护法规
   - 添加必要的用户同意机制
