# 数据库设置指南

## 问题说明
当前遇到的错误是因为 Supabase 数据库中还没有创建必要的表。您需要运行数据库迁移来创建这些表。

## 解决方案

### 方案一：通过 Supabase 控制台执行（推荐）

1. 登录到您的 [Supabase 控制台](https://app.supabase.com)
2. 选择您的项目
3. 在左侧菜单中，点击 "SQL Editor"
4. 依次执行以下 SQL 文件的内容：
   - 首先执行 `/supabase/migrations/001_create_tables.sql`
   - 然后执行 `/supabase/migrations/002_add_is_time_known_input.sql`
   - 最后执行 `/supabase/migrations/003_separate_preview_and_full_reports.sql`

### 方案二：使用 Supabase CLI

1. 安装 Supabase CLI（如果还没有安装）：
   ```bash
   npm install -g supabase
   ```

2. 登录到 Supabase：
   ```bash
   supabase login
   ```

3. 链接到您的项目：
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. 运行迁移：
   ```bash
   supabase db push
   ```

### 方案三：测试模式（当前已启用）

当前代码已经修改为支持测试模式：
- 当数据库表不存在时，报告会临时存储在内存中
- 生成的报告ID会以 `test-` 开头
- 这仅用于测试，服务器重启后数据会丢失

## 数据库表结构

迁移将创建以下表：

1. **profiles** - 用户配置文件
2. **user_reports** - 用户的命理报告
3. **payments** - 支付记录

所有表都启用了行级安全性（RLS），确保用户只能访问自己的数据。

## 注意事项

- 请确保在生产环境部署前完成数据库设置
- 测试模式的数据仅存储在内存中，不会持久化
- 建议尽快创建数据库表以获得完整功能

## 环境变量

确保您已经设置了以下环境变量：
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
