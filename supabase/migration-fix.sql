-- ============================================
-- 修复迁移脚本 v3（可安全重复执行）
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- =============================================
-- 1. 重写 admin_config 表：明文密码
-- =============================================
DROP TABLE IF EXISTS admin_config CASCADE;

CREATE TABLE admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public admin ops" ON admin_config FOR ALL USING (true) WITH CHECK (true);

INSERT INTO admin_config (username, password) VALUES ('admin', 'admin123');


-- =============================================
-- 2. 重写 pity 表：加 device_name
-- =============================================
DROP TABLE IF EXISTS pity CASCADE;

CREATE TABLE pity (
  device_id TEXT PRIMARY KEY,
  device_name TEXT DEFAULT '匿名用户',
  pulls_since_last_4star INTEGER DEFAULT 0,
  pulls_since_last_5star INTEGER DEFAULT 0,
  total_pulls INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public pity ops" ON pity FOR ALL USING (true) WITH CHECK (true);


-- =============================================
-- 3. draw_log 表（已存在则跳过建表，仅补策略）
-- =============================================
CREATE TABLE IF NOT EXISTS draw_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  device_name TEXT DEFAULT '匿名用户',
  food_id UUID,
  food_name TEXT,
  tier TEXT DEFAULT 'bronze',
  drawn_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE draw_log ENABLE ROW LEVEL SECURITY;

-- 安全创建策略：先删已有的再建
DROP POLICY IF EXISTS "Allow public draw log ops" ON draw_log;
CREATE POLICY "Allow public draw log ops" ON draw_log FOR ALL USING (true) WITH CHECK (true);

-- 索引
CREATE INDEX IF NOT EXISTS idx_draw_log_device ON draw_log(device_id, drawn_at DESC);


-- =============================================
-- 4. foods 表品级分配（按 1:3:6 比例）
--    score = 价格/100 + 热量/200 + 甜度 + 辣度
--    score 越高 → 金卡（稀有）
--    16道菜：金1~2 / 银5 / 铜9~10
-- =============================================

-- 先全部重置为铜卡
UPDATE foods SET gacha_tier = 'bronze';

-- 按 score 降序排名，分配银卡（排名 10%~40%）
-- 16道菜中排名 2~6 的分配为银卡
UPDATE foods SET gacha_tier = 'silver'
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (ORDER BY (price/100.0 + calories/200.0 + sweetness + spiciness) DESC) as rn
    FROM foods
  ) ranked
  WHERE rn BETWEEN 2 AND 6
);

-- 排名第1的分配为金卡（score 最高 = 最贵/最高热量）
UPDATE foods SET gacha_tier = 'gold'
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (ORDER BY (price/100.0 + calories/200.0 + sweetness + spiciness) DESC) as rn
    FROM foods
  ) ranked
  WHERE rn = 1
);
