-- ============================================
-- 迁移脚本：抽卡系统 + 管理员鉴权
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 1. 新增 admin_config 表（管理员账号）
CREATE TABLE IF NOT EXISTS admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 策略：仅允许读取
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read admin' AND tablename = 'admin_config') THEN
    CREATE POLICY "Allow public read admin" ON admin_config FOR SELECT USING (true);
  END IF;
END $$;

-- 插入默认管理员（用户名: admin，密码: admin123）
-- 密码经 SHA-256 哈希后的值，可在浏览器控制台执行：
-- crypto.subtle.digest('SHA-256', new TextEncoder().encode('admin123')).then(buf => console.log(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')))
-- 以下为 'admin123' 的 SHA-256 哈希值
INSERT INTO admin_config (username, password_hash)
VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9')
ON CONFLICT (username) DO NOTHING;


-- 2. 新增 pity 表（保底计数）
CREATE TABLE IF NOT EXISTS pity (
  device_id TEXT PRIMARY KEY,
  pulls_since_last_4star INTEGER DEFAULT 0,
  pulls_since_last_5star INTEGER DEFAULT 0,
  total_pulls INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 策略：允许全部操作（读写）
ALTER TABLE pity ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public pity ops' AND tablename = 'pity') THEN
    CREATE POLICY "Allow public pity ops" ON pity FOR ALL USING (true);
  END IF;
END $$;


-- 3. foods 表新增字段
ALTER TABLE foods ADD COLUMN IF NOT EXISTS gacha_tier TEXT DEFAULT 'bronze';
ALTER TABLE foods ADD COLUMN IF NOT EXISTS gacha_prob REAL DEFAULT 0;
