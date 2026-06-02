# 今天吃什么 🍜

一个极简优雅的用餐决策辅助平台，帮助用户通过随机抽卡的方式解决"今天吃什么"的选择困难症。

## 在线体验

👉 [https://ayankonji.github.io/chis/](https://ayankonji.github.io/chis/)

## 功能特性

- **美食库浏览** — 响应式网格布局展示所有美食，支持分类筛选和搜索
- **随机抽卡** — 炫酷的卡片飞入翻转动画，命运决定你的下一餐
- **美食管理** — 添加、编辑、删除美食条目
- **详情展示** — 完整的美食信息（价格、热量、甜度、辣度、温度）
- **本地存储** — 无需后端即可运行，数据保存在浏览器本地
- **丝滑动画** — 基于 Framer Motion 的页面过渡和交互动效

## 技术栈

### 前端
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- React Router
- Lucide React

### 后端（可选）
- Express.js
- SQLite3
- Multer（图片上传）

## 本地开发

### 纯前端模式（无需后端）
前端会自动检测后端是否可用，如果不可用则使用浏览器的 localStorage 存储数据。

```bash
cd frontend
npm install
npm run dev
```

### 全栈模式（含后端）

```bash
# 启动后端
cd backend
npm install
npm start

# 启动前端（新终端）
cd frontend
npm install
npm run dev
```

## 部署

### GitHub Pages
项目已配置 GitHub Actions 自动部署工作流，推送代码到 main 分支即可自动构建并部署。

### 手动部署
```bash
cd frontend
npm run build
# 将 dist 目录内容部署到静态托管服务
```

## 设计规范

- **视觉风格**：极致简约、留白充足、柔和浅色主题
- **控件设计**：16px-24px 大圆角，微妙内阴影和高光
- **字体系统**：SF Pro 字体家族，字重层级清晰
- **交互动效**：300ms-500ms ease-in-out 缓动动画
- **响应式设计**：320px ~ 4K 全尺寸适配

## 项目结构

```
今天吃什么/
├── backend/          # Express + SQLite 后端
├── frontend/         # React 前端
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── utils/        # 工具函数
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   └── dist/         # 构建产物
└── README.md
```

## License

MIT
