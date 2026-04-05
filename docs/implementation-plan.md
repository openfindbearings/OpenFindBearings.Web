# 供应商报价系统实施计划

## 项目现状分析

### 已有功能
- Vue 3 + Vite + TypeScript 项目架构
- OAuth2 认证系统（登录/注册/token 刷新）
- 产品列表、搜索、详情页
- Inquiry（询价单）前端界面，使用 localStorage 存储
- 用户中心基础页面

### 需要改造
- 后端从 localStorage 切换到真实 API
- Inquiry 模型扩展（buyerId, status, 持久化）
- 新增 Quote（报价单）完整功能
- 用户中心重构（买卖双方双视角）
- 新增可报价市场页面

---

## Phase 1：后端 API 准备（1-2 天）

### 1.1 数据库迁移
```sql
-- 改造 Inquiries 表
ALTER TABLE Inquiries ADD
    BuyerId NVARCHAR(450) NOT NULL,
    Status INT NOT NULL DEFAULT 0,  -- 0=draft, 1=published, etc.
    ExpiresAt DATETIME2,
    IsPublic BIT DEFAULT 1;

-- 创建 Quotes 表
CREATE TABLE InquiryQuotes (...)
CREATE TABLE QuoteItems (...)
```

### 1.2 后端 API 开发
- [ ] `GET /api/inquiries/my` - 我的询价单列表
- [ ] `POST /api/inquiries` - 创建询价单
- [ ] `GET /api/inquiries/{id}` - 询价单详情
- [ ] `POST /api/inquiries/{id}/publish` - 发布询价单
- [ ] `GET /api/market/inquiries` - 可报价市场（排除自己的）
- [ ] `POST /api/quotes` - 提交报价
- [ ] `GET /api/quotes/my` - 我的报价列表
- [ ] `GET /api/inquiries/{id}/quotes` - 收到的报价列表
- [ ] `POST /api/inquiries/{id}/quotes/{quoteId}/accept` - 接受报价
- [ ] `POST /api/inquiries/{id}/quotes/{quoteId}/reject` - 拒绝报价

---

## Phase 2：前端 API 层改造（0.5 天）

### 2.1 创建新的 API 模块
```
src/api/
├── inquiry.ts      # 询价单相关 API
├── quote.ts        # 报价单相关 API
└── market.ts       # 市场相关 API
```

### 2.2 定义 TypeScript 类型
```typescript
// src/types/inquiry.ts
interface Inquiry { ... }
interface InquiryItem { ... }
interface InquiryQuote { ... }
interface QuoteItem { ... }
```

### 2.3 更新认证存储
- [ ] tokenStorage 添加用户 ID 获取方法
- [ ] 确保登录后存储用户 ID

---

## Phase 3：询价单功能升级（1 天）

### 3.1 改造 Inquiry 页面
- [ ] 移除 localStorage 存储逻辑
- [ ] 对接 `POST /api/inquiries` 创建询价单
- [ ] 添加"发布"按钮（调用 publish API）
- [ ] 添加状态显示（草稿/已发布/报价中/已接受）

### 3.2 改造 UserCenter 页面 - 我的询价单
- [ ] 对接 `GET /api/inquiries/my`
- [ ] 添加状态筛选功能
- [ ] 询价单详情页增加"收到的报价"标签页

### 3.3 移除本地存储
- [ ] 删除 `inquiry_history` localStorage 相关代码
- [ ] 删除 `useInquiryStore` 中的本地存储逻辑

---

## Phase 4：报价市场功能（1 天）

### 4.1 创建 Market 页面
```
src/views/
└── market/
    ├── MarketInquiries.vue      # 可报价列表
    ├── MarketInquiryDetail.vue  # 询价单详情（供应商视角）
    └── QuoteSubmit.vue          # 提交报价页
```

### 4.2 实现功能
- [ ] 可报价列表页面（`GET /api/market/inquiries`）
- [ ] 询价单详情页（供应商视角，显示"我要报价"按钮）
- [ ] 报价录入表单（价格、交货期、付款条款等）
- [ ] 提交报价 API 对接

### 4.3 添加路由
```typescript
{ path: '/market/inquiries', component: MarketInquiries },
{ path: '/market/inquiries/:id', component: MarketInquiryDetail },
{ path: '/market/inquiries/:id/quote', component: QuoteSubmit }
```

---

## Phase 5：我的报价功能（0.5 天）

### 5.1 创建 MyQuotes 页面
- [ ] 我的报价列表（`GET /api/quotes/my`）
- [ ] 报价详情页
- [ ] 状态显示（已提交/被接受/被拒绝）

### 5.2 集成到用户中心
- [ ] 用户中心添加"我的销售"TAB
- [ ] 包含"可报价市场"和"我的报价"两个子项

---

## Phase 6：询价单详情增强（1 天）

### 6.1 买家视角 - 收到的报价
- [ ] 对接 `GET /api/inquiries/{id}/quotes`
- [ ] 报价对比表格（价格、交货期、付款条款）
- [ ] 接受/拒绝报价按钮
- [ ] 接受后询价单状态变更

### 6.2 供应商视角
- [ ] 已报价提示（显示"您已提交报价"）
- [ ] 查看我的报价链接

---

## Phase 7：导航和路由重构（0.5 天）

### 7.1 更新 AppHeader
- [ ] 添加"市场"入口（给供应商看的可报价列表）
- [ ] 用户中心入口保持（点击用户名进入）

### 7.2 用户中心布局重构
```
用户中心
├── 我的采购
│   └── 我的询价单
└── 我的销售
    ├── 可报价市场
    └── 我的报价
```

---

## Phase 8：测试和优化（1 天）

### 8.1 功能测试
- [ ] 完整流程测试：创建询价单 -> 发布 -> 另一个账号报价 -> 接受报价
- [ ] 边界情况：自报价拦截、重复报价拦截、过期报价处理

### 8.2 权限测试
- [ ] 未登录用户访问限制
- [ ] 只能看自己的询价单
- [ ] 只能看自己的报价

### 8.3 UI 优化
- [ ] 空状态提示
- [ ] 加载状态
- [ ] 错误处理

---

## 实施顺序建议

### 第 1 天
1. 后端 API 开发（或确认后端已就绪）
2. 前端 API 层和类型定义

### 第 2 天
3. 询价单功能升级（对接真实 API）
4. 移除 localStorage 逻辑

### 第 3 天
5. 报价市场功能（Market 页面）
6. 提交报价功能

### 第 4 天
7. 我的报价功能
8. 用户中心重构

### 第 5 天
9. 询价单详情增强（收到的报价、接受/拒绝）
10. 全面测试

---

## 关键注意事项

1. **自报价拦截**：前端显示"我要报价"按钮前，先检查 buyerId !== currentUserId
2. **状态同步**：接受报价后，同时更新 Inquiry 和 Quote 的状态
3. **数据隔离**：确保 API 层正确处理权限，不能通过改 URL 看到别人的数据
4. **用户体验**：加载状态、错误提示、操作确认对话框

---

## 依赖关系图

```
后端 API 准备
    ↓
前端 API 层
    ↓
询价单升级 ────────┐
    ↓              │
用户中心重构       │
    ↓              │
市场功能 ──────────┤
    ↓              │
我的报价 ──────────┤
    ↓              ↓
询价单详情（收到的报价）
    ↓
测试验收
```
