-- ============================================
-- RLS 策略修复：确保 pity 和 draw_log 的读写权限完整
-- 在 Supabase Dashboard > SQL Editor 执行
-- ============================================

-- pity 表：删除旧策略，重建完整的读写策略
DROP POLICY IF EXISTS "Allow public pity ops" ON pity;
CREATE POLICY "Allow public pity ops" ON pity FOR ALL USING (true) WITH CHECK (true);

-- draw_log 表：删除旧策略，重建完整的读写策略
DROP POLICY IF EXISTS "Allow public draw log ops" ON draw_log;
CREATE POLICY "Allow public draw log ops" ON draw_log FOR ALL USING (true) WITH CHECK (true);

-- admin_config 表：确保有写入权限（后续修改密码用）
DROP POLICY IF EXISTS "Allow public read admin" ON admin_config;
CREATE POLICY "Allow public admin ops" ON admin_config FOR ALL USING (true) WITH CHECK (true);
