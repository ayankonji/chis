# 今天吃什么 🍜

一个极简优雅的用餐决策辅助平台，帮助用户通过随机抽卡的方式解决"今天吃什么"的选择困难症。

## 在线体验

👉 [https://ayankonji.github.io/chis/](https://ayankonji.github.io/chis/)

---

## 功能特性

- **美食库浏览** — 响应式网格布局展示所有美食，支持分类筛选和搜索
- **随机抽卡** — 炫酷的卡片飞入翻转动画，命运决定你的下一餐
- **美食管理** — 添加、编辑、删除美食条目
- **详情展示** — 完整的美食信息（价格、热量、甜度、辣度、温度）
- **云端数据** — 使用 Supabase 免费云数据库，数据永久保存
- **丝滑动画** — 基于 Framer Motion 的页面过渡和交互动效

---

## 技术架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   GitHub Pages  │────▶│  Vercel Serverless│────▶│   Supabase      │
│   (React 前端)   │     │   Functions      │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 前端
- React 18 + Vite + Tailwind CSS + Framer Motion
- 部署在 GitHub Pages（纯静态托管）

### 后端
- Vercel Serverless Functions（零运维）
- 部署在 Vercel

### 数据库
- Supabase（免费 PostgreSQL 云数据库）
- 数据永久保存，跨设备同步

---

## 部署指南（Supabase + Vercel）

### 第一步：创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com) 注册账号
2. 点击 **New Project**，创建一个新项目
3. 等待项目初始化完成（约 1-2 分钟）

### 第二步：创建数据库表

1. 进入项目 Dashboard → **SQL Editor**
2. 新建一个查询，粘贴 [`supabase/init.sql`](supabase/init.sql) 中的全部内容
3. 点击 **Run**，创建表并插入示例数据

### 第三步：获取 API 密钥

1. 点击左侧 **Project Settings** → **API**
2. 复制以下两个值：
   - `URL` → 例如 `https://xxxxxxxxxxxx.supabase.co`
   - `anon public` API key → 例如 `eyJhbG...`

### 第四步：部署后端到 Vercel

1. 访问 [https://vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 点击 **Add New Project** → 导入 `ayankonji/chis` 仓库
3. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `./`（根目录）
4. 点击 **Environment Variables**，添加：
   - `SUPABASE_URL` = 你复制的 Supabase URL
   - `SUPABASE_ANON_KEY` = 你复制的 anon key
5. 点击 **Deploy**

部署完成后，你会得到一个类似 `https://chis-xxx.vercel.app` 的域名。

### 第五步：配置前端 API 地址

1. 打开 `frontend/src/utils/api.js`
2. 找到第 12 行：
   ```js
   const API_BASE = '';
   ```
3. 改成你的 Vercel 域名：
   ```js
   const API_BASE = 'https://chis-xxx.vercel.app';
   ```
4. 提交并推送到 GitHub，GitHub Actions 会自动重新部署前端

```bash
git add .
git commit -m "config: connect to Vercel backend"
git push
```

### 第六步：验证

1. 打开前端页面 `https://ayankonji.github.io/chis/`
2. 尝试添加一道新美食
3. 刷新页面，数据应该仍然存在 ✅
4. 换一台手机/电脑访问，数据也会同步 ✅

---

## 本地开发

### 纯前端模式（无需后端，数据存浏览器）

```bash
cd frontend
npm install
npm run dev
```

### 全栈模式（本地后端 + 前端）

```bash
# 1. 启动旧版 Express 后端
cd backend
npm install
npm start          # 运行在 http://localhost:3001

# 2. 启动前端（新终端）
cd frontend
npm install
npm run dev        # 运行在 http://localhost:5173
```

---

## 项目结构

```
今天吃什么/
├── api/                    # Vercel Serverless Functions（云端后端）
│   ├── _lib/
│   │   └── db.js          # Supabase 客户端配置
│   ├── foods.js           # GET/POST /api/foods
│   ├── foods/
│   │   └── [id].js        # GET/PUT/DELETE /api/foods/:id
│   ├── draw.js            # GET /api/draw
│   ├── categories.js      # GET /api/categories
│   └── health.js          # GET /api/health
├── frontend/              # React 前端
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── utils/         # 工具函数
│   │   │   └── api.js     # API 调用封装（可配置后端地址）
│   │   └── ...
│   ├── public/
│   └── dist/              # 构建产物
├── backend/               # 旧版 Express 后端（本地开发用）
├── supabase/
│   └── init.sql           # 数据库初始化脚本
├── .github/workflows/     # GitHub Actions 自动部署
├── vercel.json            # Vercel 配置
├── .env.example           # 环境变量模板
└── README.md
```

---

## 设计规范

- **视觉风格**：极致简约、留白充足、柔和浅色主题
- **控件设计**：16px-24px 大圆角，微妙内阴影和高光
- **字体系统**：SF Pro 字体家族，字重层级清晰
- **交互动效**：300ms-500ms ease-in-out 缓动动画
- **响应式设计**：320px ~ 4K 全尺寸适配

---

## License

MIT
