-- 修改 user_reports 表结构，分别存储预览和完整报告

-- 首先重命名现有的列
ALTER TABLE public.user_reports 
RENAME COLUMN preview_report TO preview_report_old;

ALTER TABLE public.user_reports 
RENAME COLUMN full_report TO full_report_old;

-- 添加新的列
ALTER TABLE public.user_reports 
ADD COLUMN preview_report TEXT,
ADD COLUMN full_report TEXT;

-- 迁移现有数据
UPDATE public.user_reports 
SET 
  preview_report = preview_report_old::text,
  full_report = full_report_old::text
WHERE preview_report_old IS NOT NULL OR full_report_old IS NOT NULL;

-- 删除旧列
ALTER TABLE public.user_reports 
DROP COLUMN preview_report_old,
DROP COLUMN full_report_old;

-- 添加注释
COMMENT ON COLUMN public.user_reports.preview_report IS '免费预览报告内容（500-800字）';
COMMENT ON COLUMN public.user_reports.full_report IS '付费完整报告内容（3000+字）';

-- 更新 is_paid 列的注释
COMMENT ON COLUMN public.user_reports.is_paid IS '是否已付费解锁完整报告';
