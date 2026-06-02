-- 创建 foods 表
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price REAL DEFAULT 0,
  calories INTEGER DEFAULT 0,
  sweetness INTEGER DEFAULT 0 CHECK (sweetness >= 0 AND sweetness <= 5),
  spiciness INTEGER DEFAULT 0 CHECK (spiciness >= 0 AND spiciness <= 5),
  temperature TEXT DEFAULT '常温' CHECK (temperature IN ('冰', '热', '常温')),
  image TEXT,
  category TEXT DEFAULT '其他',
  description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入示例数据
INSERT INTO foods (name, price, calories, sweetness, spiciness, temperature, image, category, description) VALUES
('红烧肉', 38, 520, 1, 0, '热', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop', '中餐', '肥而不腻，入口即化的经典家常菜'),
('麻婆豆腐', 22, 280, 0, 4, '热', 'https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?w=600&h=400&fit=crop', '中餐', '麻辣鲜香，下饭神器'),
('草莓蛋糕', 28, 350, 5, 0, '冰', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop', '甜点', '绵软细腻，甜而不腻'),
('日式拉面', 35, 480, 0, 1, '热', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop', '日料', '浓郁骨汤，劲道面条'),
('水果沙拉', 25, 120, 3, 0, '冰', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop', '轻食', '新鲜水果，健康低脂'),
('炸鸡排', 18, 450, 0, 2, '热', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&h=400&fit=crop', '快餐', '外酥里嫩，香气四溢'),
('珍珠奶茶', 15, 280, 4, 0, '冰', 'https://images.unsplash.com/photo-1558855410-3112e335e629?w=600&h=400&fit=crop', '饮品', 'Q弹珍珠，丝滑奶茶'),
('麻辣火锅', 88, 800, 0, 5, '热', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&h=400&fit=crop', '中餐', '麻辣鲜香，聚餐首选'),
('意大利面', 42, 420, 1, 0, '热', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop', '西餐', '经典番茄肉酱意面'),
('寿司拼盘', 68, 320, 1, 0, '常温', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop', '日料', '新鲜食材，精致呈现'),
('烤肉拌饭', 32, 580, 1, 2, '热', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop', '韩料', '炭火烤肉，粒粒飘香'),
('芒果冰沙', 22, 200, 5, 0, '冰', 'https://images.unsplash.com/photo-1516559828984-fb3b99548b21?w=600&h=400&fit=crop', '饮品', '清甜芒果，冰爽解暑'),
('清蒸鲈鱼', 58, 220, 0, 0, '热', 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop', '中餐', '鲜嫩可口，营养丰富'),
('牛排', 98, 600, 0, 0, '热', 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=400&fit=crop', '西餐', '外焦里嫩，汁水丰盈'),
('冬阴功汤', 45, 180, 1, 3, '热', 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&h=400&fit=crop', '泰料', '酸辣开胃，异域风情'),
('抹茶拿铁', 24, 150, 3, 0, '热', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&h=400&fit=crop', '饮品', '日式抹茶，香醇顺滑');
