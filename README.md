# OpenFindBearings Web

专业的轴承 B2B 采购平台前端应用，采用现代化的编辑器风格设计，提供高效的产品搜索、对比和询价功能。

## ✨ 特性

- **编辑器风格落地页** - 创新的文字环绕圆形障碍物布局，支持多段首下沉效果
- **智能产品搜索** - 快速查找所需轴承产品
- **产品参数对比** - 直观对比不同产品的技术参数
- **在线询价系统** - 便捷的询价单管理
- **用户中心** - 个人信息、询价记录管理

## 🛠️ 技术栈

- **框架**: Vue 3.5 + TypeScript
- **构建工具**: Vite 8.0
- **UI 组件**: Ant Design Vue
- **路由**: Vue Router 4
- **状态管理**: 组合式 API (Composition API)
- **文字布局**: @chenglou/pretext - 自定义文字环绕布局引擎
- **代码规范**: ESLint + Prettier

## 📁 项目结构

```
OpenFindBearings.Web/
├── src/
│   ├── api/           # API 接口层
│   ├── assets/        # 静态资源
│   ├── components/    # 通用组件
│   ├── composables/    # 组合式函数
│   ├── config/        # 配置文件（如落地页文字配置）
│   ├── mock/          # 模拟数据
│   ├── router/        # 路由配置
│   ├── utils/         # 工具函数（文字布局算法等）
│   ├── views/         # 页面视图
│   ├── App.vue        # 根组件
│   └── main.ts        # 应用入口
├── public/            # 公共静态资源
└── dist/              # 构建输出目录
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## ⚙️ 配置说明

### API 配置

在项目根目录创建 `.env` 文件（参考 `.env.example`）：

```bash
# API 模式：mock（模拟数据）或 real（真实 API）
VITE_API_MODE=mock

# 远程 API 地址（当 VITE_API_MODE=real 时生效）
VITE_API_URL=http://localhost:5000
```

**不同环境的配置示例：**

```bash
# 本地开发（连接本地后端）
VITE_API_MODE=real
VITE_API_URL=http://localhost:5000

# 开发环境
VITE_API_MODE=real
VITE_API_URL=https://api-dev.openfindbearings.com

# 测试环境
VITE_API_MODE=real
VITE_API_URL=https://api-test.openfindbearings.com

# 生产环境
VITE_API_MODE=real
VITE_API_URL=https://api.openfindbearings.com
```

**注意：** 修改 `.env` 文件后需要重启开发服务器才能生效。

### 落地页文字配置

编辑 `src/config/landing.ts` 可以自定义落地页展示的文字内容。

## 📦 常用命令

```bash
npm run dev         # 启动开发服务器
npm run build       # 生产构建
npm run preview     # 预览生产构建
npm run type-check  # TypeScript 类型检查
```

## 🔗 相关项目

- **[OpenFindBearings.Api](../OpenFindBearings.Api/)** - .NET Web API 后端
- **[OpenFindBearings.Mobile](../OpenFindBearings.Mobile/)** - MAUI 移动端应用（计划中）

## 📄 许可证

MIT
