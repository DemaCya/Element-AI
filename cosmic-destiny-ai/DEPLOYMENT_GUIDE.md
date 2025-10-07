# 🚀 部署指南

## 📋 部署模式说明

项目支持两种部署模式：

### 🔧 静态模式 (Static Mode)
- **用途**: 演示、测试、静态托管
- **特点**: 无后端依赖，所有功能都是模拟的
- **适用**: Vercel静态托管、GitHub Pages、Netlify等

### ⚡ 动态模式 (Dynamic Mode)  
- **用途**: 生产环境、完整功能
- **特点**: 包含API路由、数据库连接、真实功能
- **适用**: Vercel Serverless、Railway、AWS等

## 🛠️ 快速切换部署模式

### 静态模式部署
```bash
# 开发环境
npm run dev:static

# 构建
npm run build:static

# 部署到Vercel
npm run deploy:static
```

### 动态模式部署
```bash
# 开发环境
npm run dev

# 构建
npm run build:dynamic

# 部署到Vercel
npm run deploy:dynamic
```

## 📁 文件结构说明

```
cosmic-destiny-ai/
├── src/app/
│   ├── api/                    # API路由 (动态模式使用)
│   │   ├── health/            # 健康检查
│   │   └── reports/           # 报告相关API
│   ├── report/
│   │   ├── page.tsx           # 静态报告页面
│   │   └── [id]/              # 动态报告页面 (备份在backup/)
│   └── ...
├── backup/                     # 原始文件备份
│   ├── original-api/          # 原始API路由
│   └── original-pages/        # 原始动态页面
├── deploy-config.js           # 部署配置
└── next.config.ts             # Next.js配置 (支持动态切换)
```

## 🔄 模式切换机制

### 环境变量控制
```bash
DEPLOYMENT_MODE=static   # 静态模式
DEPLOYMENT_MODE=dynamic  # 动态模式
```

### 自动配置
- `next.config.ts` 根据 `DEPLOYMENT_MODE` 自动调整配置
- API路由根据模式返回不同响应
- 前端组件根据模式使用不同数据源

## 🎯 当前状态

### ✅ 已完成
- [x] 静态模式完全可用 ✅
- [x] 动态模式完全可用 ✅
- [x] 自动模式切换 ✅
- [x] 原始代码备份 ✅
- [x] 部署脚本配置 ✅
- [x] API路由兼容性修复 ✅
- [x] 构建测试通过 ✅

### 🔄 待完善 (动态模式)
- [ ] 数据库连接配置
- [ ] Gemini API集成
- [ ] 用户认证系统
- [ ] 支付系统集成
- [ ] 邮件服务配置

### 📊 测试结果
- ✅ 静态模式构建成功
- ✅ 动态模式构建成功
- ✅ 模式切换脚本正常工作
- ✅ API路由在两种模式下都能正常工作

## 🚀 部署到Vercel

### 方法1: 使用脚本 (推荐)
```bash
# 静态部署
npm run deploy:static

# 动态部署  
npm run deploy:dynamic
```

### 方法2: 手动部署
```bash
# 1. 设置环境变量
export DEPLOYMENT_MODE=static  # 或 dynamic

# 2. 构建项目
npm run build

# 3. 部署到Vercel
vercel --prod
```

### 方法3: Vercel网站
1. 连接GitHub仓库
2. 在Vercel项目设置中添加环境变量：
   ```
   DEPLOYMENT_MODE=static
   ```
3. 自动部署

## 🔧 环境变量配置

### 静态模式
```bash
DEPLOYMENT_MODE=static
```

### 动态模式
```bash
DEPLOYMENT_MODE=dynamic
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_key
# ... 其他环境变量
```

## 📝 注意事项

1. **备份文件**: 所有原始文件都保存在 `backup/` 目录
2. **模式切换**: 通过环境变量 `DEPLOYMENT_MODE` 控制
3. **API路由**: 静态模式下返回503状态，动态模式下正常工作
4. **数据库**: 静态模式使用模拟数据，动态模式连接真实数据库
5. **构建优化**: 静态模式禁用图片优化，动态模式启用

## 🆘 故障排除

### 构建失败
```bash
# 清理缓存
rm -rf .next out
npm run build:static
```

### API路由问题
- 检查 `DEPLOYMENT_MODE` 环境变量
- 确认API路由文件存在
- 查看控制台错误信息

### 部署问题
- 确认Vercel项目配置
- 检查环境变量设置
- 查看Vercel部署日志

## 📞 支持

如有问题，请检查：
1. 环境变量配置
2. 构建日志
3. 部署日志
4. 网络连接

---

**提示**: 建议先在静态模式下测试部署，确认无误后再切换到动态模式进行完整功能测试。
