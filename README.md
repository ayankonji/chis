# 今天吃什么 🍜

一个极简优雅的"今天吃什么"决策辅助平台，帮助你通过随机抽卡的方式解决用餐选择困难症。

## ✨ 特性

- **美食库**：响应式网格布局，支持分类筛选和搜索
- **随机抽卡**：一键随机选择，解决选择困难症
- **添加美食**：支持上传图片或输入 URL
- **编辑/删除**：完整的美食管理功能
- **iOS 18 风格**：柔和浅色主题、大圆角、丝滑动画

## 🏗️ 技术架构

```
前端：React 18 + Vite + Tailwind CSS + Framer Motion
数据库：Supabase PostgreSQL（直连，无需后端中间层）
部署：GitHub Pages
```

**极简架构**：前端直接调用 Supabase REST API，无需任何后端服务器。

## 🚀 在线体验

[https://ayankonji.github.io/chis/](https://ayankonji.github.io/chis/)

## 🛠️ 本地开发

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

## 📦 部署到 GitHub Pages

1. Fork 或克隆本仓库
2. 在 Supabase 创建项目，执行 `supabase/init.sql` 创建表
3. （可选）执行 `supabase/rls-policies.sql` 设置 RLS 策略
4. 修改 `frontend/src/utils/api.js` 中的 Supabase URL 和 Key
5. Push 到 GitHub，GitHub Actions 自动部署

## 📁 项目结构

```
├── frontend/
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   └── utils/
│   │       └── api.js      # Supabase API 直连
│   ├── dist/               # 构建产物
│   └── package.json
├── supabase/
│   ├── init.sql            # 数据库初始化
│   └── rls-policies.sql    # RLS 安全策略
└── .github/workflows/      # GitHub Actions 部署
```

## 📝 License

MIT
