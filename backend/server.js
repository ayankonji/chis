const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'food-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 JPEG, PNG, WebP 格式的图片'));
    }
  }
});

// 获取所有美食
app.get('/api/foods', (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM foods WHERE 1=1';
  const params = [];

  if (category && category !== '全部') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  sql += ' ORDER BY created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});

// 获取单个美食
app.get('/api/foods/:id', (req, res) => {
  db.get('SELECT * FROM foods WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: '美食不存在' });
    }
    res.json({ data: row });
  });
});

// 创建美食
app.post('/api/foods', upload.single('image'), (req, res) => {
  const { name, price, calories, sweetness, spiciness, temperature, category, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image || null;

  db.run(
    `INSERT INTO foods (name, price, calories, sweetness, spiciness, temperature, image, category, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, price || 0, calories || 0, sweetness || 0, spiciness || 0, temperature || '常温', image, category || '其他', description || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ data: { id: this.lastID } });
    }
  );
});

// 更新美食
app.put('/api/foods/:id', upload.single('image'), (req, res) => {
  const { name, price, calories, sweetness, spiciness, temperature, category, description } = req.body;
  let image = req.body.image;
  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  db.run(
    `UPDATE foods SET name=?, price=?, calories=?, sweetness=?, spiciness=?, temperature=?, image=?, category=?, description=?
     WHERE id=?`,
    [name, price || 0, calories || 0, sweetness || 0, spiciness || 0, temperature || '常温', image, category || '其他', description || '', req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ data: { updated: this.changes } });
    }
  );
});

// 删除美食
app.delete('/api/foods/:id', (req, res) => {
  db.run('DELETE FROM foods WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: { deleted: this.changes } });
  });
});

// 随机抽取一个美食
app.get('/api/draw', (req, res) => {
  db.get('SELECT * FROM foods ORDER BY RANDOM() LIMIT 1', (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: '美食库为空' });
    }
    res.json({ data: row });
  });
});

// 获取分类列表
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM foods ORDER BY category', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const categories = rows.map(r => r.category);
    res.json({ data: categories });
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🍜 今天吃什么 后端服务运行在 http://localhost:${PORT}`);
});

module.exports = app;
