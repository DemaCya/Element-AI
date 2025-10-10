# 问题调试指南

## 问题描述
1. 点击生成报告后数据没有上传到Supabase数据库
2. 一直卡在Loading...页面

## 调试步骤

### 1. 检查浏览器控制台
打开浏览器开发者工具，查看Console标签页，寻找以下信息：

#### 成功日志应该看到：
```
🚀 开始生成报告流程
📝 用户信息: [用户ID]
📝 报告数据: [出生数据]
📱 使用客户端逻辑生成报告
🔮 开始计算八字...
✅ 八字计算完成: [八字数据]
💾 保存到数据库...
📝 插入数据: [插入的数据]
✅ 报告保存成功, ID: [报告ID]
🔄 重新获取报告列表...
🔀 跳转到报告页面...
```

#### 错误日志可能看到：
```
❌ 数据库插入失败: [错误信息]
❌ Supabase连接测试失败: [错误信息]
💥 生成报告失败: [错误信息]
```

### 2. 检查Supabase连接
在浏览器控制台运行：
```javascript
// 测试数据库连接
await window.testDatabaseConnection()
```

### 3. 检查环境变量
确保Vercel项目设置中配置了：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 检查Supabase数据库设置

#### 4.1 检查表结构
确保 `user_reports` 表存在且包含以下字段：
- id (uuid, primary key)
- user_id (uuid, foreign key)
- name (text)
- birth_date (date)
- birth_time (time)
- timezone (text)
- gender (text)
- is_time_known_input (boolean)
- is_paid (boolean)
- bazi_data (jsonb)
- preview_report (text)
- full_report (text)
- created_at (timestamp)

#### 4.2 检查RLS策略
确保有正确的Row Level Security策略：
```sql
-- 允许用户查看自己的报告
CREATE POLICY "Users can view own reports" ON user_reports
  FOR SELECT USING (auth.uid() = user_id);

-- 允许用户插入自己的报告
CREATE POLICY "Users can insert own reports" ON user_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### 4.3 检查CORS设置
在Supabase Dashboard中：
1. 进入 Settings → API
2. 在 Site URL 中添加你的Vercel域名
3. 在 Additional Redirect URLs 中添加你的域名

### 5. 常见问题解决

#### 问题1：CORS错误
**症状：** 控制台显示CORS相关错误
**解决：** 检查Supabase CORS设置

#### 问题2：认证错误
**症状：** 显示用户未认证或权限不足
**解决：** 检查用户登录状态和RLS策略

#### 问题3：网络超时
**症状：** 请求长时间无响应
**解决：** 检查网络连接和Supabase服务状态

#### 问题4：数据格式错误
**症状：** 数据库插入失败，显示字段类型错误
**解决：** 检查数据格式和表结构

### 6. 手动测试步骤

1. **测试用户认证**
   - 确保用户已登录
   - 检查 `user` 对象是否存在

2. **测试Supabase连接**
   - 在控制台运行 `await window.testDatabaseConnection()`
   - 查看返回结果

3. **测试数据插入**
   - 手动构造测试数据
   - 尝试插入到数据库

4. **测试页面跳转**
   - 检查路由是否正确
   - 确保报告页面可以正常加载

### 7. 联系支持

如果问题仍然存在，请提供：
1. 浏览器控制台的完整错误日志
2. Supabase Dashboard中的错误日志
3. 网络请求的详细信息
4. 重现问题的具体步骤

## 预期行为

正常情况下，生成报告的流程应该是：
1. 用户填写出生信息
2. 点击生成报告
3. 显示Loading状态
4. 计算八字
5. 生成报告内容
6. 保存到数据库
7. 跳转到报告页面
8. 显示生成的报告

如果任何一步失败，都会显示相应的错误信息。
