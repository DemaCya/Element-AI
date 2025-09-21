-- 添加报告名称字段
ALTER TABLE public.user_reports 
ADD COLUMN IF NOT EXISTS name TEXT;

-- 为现有报告添加默认名称
UPDATE public.user_reports 
SET name = '命理报告 ' || to_char(created_at, 'YYYY-MM-DD HH24:MI')
WHERE name IS NULL;

-- 添加注释
COMMENT ON COLUMN public.user_reports.name IS '用户自定义的报告名称';

-- 添加索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_user_reports_user_created 
ON public.user_reports(user_id, created_at DESC);

-- 添加索引以支持按名称搜索
CREATE INDEX IF NOT EXISTS idx_user_reports_name 
ON public.user_reports(name);

-- 确保 is_time_known 字段有默认值
ALTER TABLE public.user_reports 
ALTER COLUMN is_time_known_input SET DEFAULT false;

-- 优化查询性能：为常用的组合查询创建复合索引
CREATE INDEX IF NOT EXISTS idx_user_reports_user_paid_created 
ON public.user_reports(user_id, is_paid, created_at DESC);

-- 添加数据完整性约束
ALTER TABLE public.user_reports 
ADD CONSTRAINT check_gender_valid 
CHECK (gender IN ('male', 'female'));

-- 添加报告创建时间的合理性检查
ALTER TABLE public.user_reports 
ADD CONSTRAINT check_dates_valid 
CHECK (created_at >= '2024-01-01'::timestamp);
