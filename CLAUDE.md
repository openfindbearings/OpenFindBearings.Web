# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenFindBearings.Web — Vue 3 + Vite + TypeScript 轴承 B2B 采购平台前端。

## Build & Run

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## API 配置

在 `.env` 文件中配置：

```bash
# 使用模拟数据（默认）
VITE_API_MODE=mock

# 使用真实 API
VITE_API_MODE=real
VITE_API_URL=http://localhost:5000
```

## Key Paths

- `src/api/` — API 调用层
- `src/views/` — 页面视图
- `src/components/` — 通用组件
- `src/composables/` — 组合式函数
- `src/mock/` — 模拟数据

## 相关项目

- `../OpenFindBearings.Api/` — .NET Web API 后端
- `../OpenFindFindBearings.Mobile/` — MAUI 移动端应用
