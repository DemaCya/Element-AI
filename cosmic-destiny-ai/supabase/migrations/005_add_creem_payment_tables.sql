-- 创建结账会话表
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  report_id UUID NOT NULL REFERENCES user_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_id TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_session_id ON checkout_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_report_id ON checkout_sessions(report_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_request_id ON checkout_sessions(request_id);

-- 更新支付表以支持 Creem
ALTER TABLE payments ADD COLUMN IF NOT EXISTS checkout_session_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'creem';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_payments_checkout_session_id ON payments(checkout_session_id);

-- 更新用户报告表以支持支付ID
ALTER TABLE user_reports ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_reports_payment_id ON user_reports(payment_id);

-- 创建 RLS 策略
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的结账会话
CREATE POLICY "Users can view their own checkout sessions" ON checkout_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的结账会话
CREATE POLICY "Users can insert their own checkout sessions" ON checkout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的结账会话
CREATE POLICY "Users can update their own checkout sessions" ON checkout_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- 系统可以插入结账会话（用于 webhook）
CREATE POLICY "System can insert checkout sessions" ON checkout_sessions
  FOR INSERT WITH CHECK (true);

-- 系统可以更新结账会话（用于 webhook）
CREATE POLICY "System can update checkout sessions" ON checkout_sessions
  FOR UPDATE USING (true);
