const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL DEFAULT 0,
      calories INTEGER DEFAULT 0,
      sweetness INTEGER DEFAULT 0 CHECK(sweetness >= 0 AND sweetness <= 5),
      spiciness INTEGER DEFAULT 0 CHECK(spiciness >= 0 AND spiciness <= 5),
      temperature TEXT DEFAULT '常温' CHECK(temperature IN ('冰', '热', '常温')),
      image TEXT,
      category TEXT DEFAULT '其他',
      description TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.get("SELECT COUNT(*) as count FROM foods", (err, row) => {
    if (err) {
      console.error('查询失败:', err);
      return;
    }
    if (row.count === 0) {
      const sampleFoods = [
        ['红烧肉', 38, 520, 1, 0, '热', '/images/hongshaorou.jpg', '中餐', '肥而不腻，入口即化的经典家常菜'],
        ['麻婆豆腐', 22, 280, 0, 4, '热', '/images/mapo.jpg', '中餐', '麻辣鲜香，下饭神器'],
        ['草莓蛋糕', 28, 350, 5, 0, '冰', '/images/cake.jpg', '甜点', '绵软细腻，甜而不腻'],
        ['日式拉面', 35, 480, 0, 1, '热', '/images/ramen.jpg', '日料', '浓郁骨汤，劲道面条'],
        ['水果沙拉', 25, 120, 3, 0, '冰', '/images/salad.jpg', '轻食', '新鲜水果，健康低脂'],
        ['炸鸡排', 18, 450, 0, 2, '热', '/images/chicken.jpg', '快餐', '外酥里嫩，香气四溢'],
        ['珍珠奶茶', 15, 280, 4, 0, '冰', '/images/bubbletea.jpg', '饮品', 'Q弹珍珠，丝滑奶茶'],
        ['麻辣火锅', 88, 800, 0, 5, '热', '/images/hotpot.jpg', '中餐', '麻辣鲜香，聚餐首选'],
        ['意大利面', 42, 420, 1, 0, '热', '/images/pasta.jpg', '西餐', '经典番茄肉酱意面'],
        ['寿司拼盘', 68, 320, 1, 0, '常温', '/images/sushi.jpg', '日料', '新鲜食材，精致呈现'],
        ['烤肉拌饭', 32, 580, 1, 2, '热', '/images/bbq-rice.jpg', '韩料', '炭火烤肉，粒粒飘香'],
        ['芒果冰沙', 22, 200, 5, 0, '冰', '/images/mango.jpg', '饮品', '清甜芒果，冰爽解暑'],
        ['清蒸鲈鱼', 58, 220, 0, 0, '热', '/images/fish.jpg', '中餐', '鲜嫩可口，营养丰富'],
        ['牛排', 98, 600, 0, 0, '热', '/images/steak.jpg', '西餐', '外焦里嫩，汁水丰盈'],
        ['冬阴功汤', 45, 180, 1, 3, '热', '/images/tomyum.jpg', '泰料', '酸辣开胃，异域风情'],
        ['抹茶拿铁', 24, 150, 3, 0, '热', '/images/matcha.jpg', '饮品', '日式抹茶，香醇顺滑']
      ];

      const stmt = db.prepare(`
        INSERT INTO foods (name, price, calories, sweetness, spiciness, temperature, image, category, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      sampleFoods.forEach(food => stmt.run(food));
      stmt.finalize();
      console.log('已插入示例数据');
    }
  });
});

module.exports = db;
