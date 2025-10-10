# 部署修复说明

## 问题描述
在Vercel部署时遇到错误：
```
Error: export const dynamic = "force-dynamic" on page "/api/reports/generate" cannot be used with "output: export"
```

## 解决方案

### 1. 环境变量配置
在Vercel项目设置中添加以下环境变量：

```
DEPLOYMENT_MODE=static
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 部署模式说明

#### 静态模式 (DEPLOYMENT_MODE=static)
- ✅ 适合Vercel免费版
- ✅ 使用静态导出
- ✅ API路由在静态模式下返回503错误
- ✅ 前端使用客户端逻辑处理报告生成

#### 动态模式 (DEPLOYMENT_MODE=dynamic)
- ✅ 需要Vercel Pro或自建服务器
- ✅ 支持完整的API路由
- ✅ 服务端处理报告生成
- ✅ 更好的性能和安全性

### 3. 代码修改

1. **next.config.ts**: 根据环境变量动态配置
2. **API路由**: 在静态模式下返回适当错误
3. **Dashboard**: 自动检测模式并选择处理方式

### 4. 部署步骤

1. 在Vercel项目设置中配置环境变量
2. 重新部署项目
3. 测试报告生成功能

## 测试验证

### 静态模式测试
- 访问主页，填写出生信息
- 点击生成报告
- 应该看到客户端处理逻辑
- 报告应该正常生成和显示

### 动态模式测试
- 设置 `DEPLOYMENT_MODE=dynamic`
- 重新部署
- 测试API端点 `/api/reports/generate`
- 验证服务端处理逻辑

## 注意事项

1. 静态模式下的API调用会返回503错误，这是正常的
2. 前端会自动检测模式并选择相应的处理方式
3. 确保Supabase环境变量正确配置
4. 时区设置为UTC以确保一致性
