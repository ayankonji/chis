-- ============================================
-- RLS 策略 - 允许匿名用户读写 foods 表
-- 如果 Supabase 项目默认开启了 RLS，需要执行这个脚本
-- ============================================

-- 开启 RLS
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取
CREATE POLICY "Allow public read" ON foods
  FOR SELECT USING (true);

-- 允许所有人插入
CREATE POLICY "Allow public insert" ON foods
  FOR INSERT WITH CHECK (true);

-- 允许所有人更新
CREATE POLICY "Allow public update" ON foods
  FOR UPDATE USING (true) WITH CHECK (true);

-- 允许所有人删除
CREATE POLICY "Allow public delete" ON foods
  FOR DELETE USING (true);
