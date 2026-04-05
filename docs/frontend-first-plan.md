# 前端先行开发计划（后端 API 未就绪）

## 策略概述

采用 **Mock API 先行** 策略：
1. 扩展类型定义，与后端设计文档保持一致
2. 创建 Mock API 层，模拟后端响应
3. 前端页面按真实接口开发，使用 Mock 数据
4. 后端 API 就绪后，仅需切换 API 实现层

---

## 第一阶段：基础设施准备（半天）

### 1.1 创建类型定义文件

```
src/types/
├── inquiry.ts      # 询价单类型
├── quote.ts        # 报价单类型
├── user.ts         # 用户类型
└── api.ts          # API 通用类型
```

**Inquiry 类型扩展：**
```typescript
// src/types/inquiry.ts
export type InquiryStatus = 
  | 'draft'           // 草稿
  | 'published'       // 已发布，等待报价
  | 'quoting'         // 报价中
  | 'quoted'          // 报价完成
  | 'accepted'        // 已接受报价
  | 'rejected'        // 已拒绝
  | 'expired'         // 已过期
  | 'cancelled'       // 已取消

export interface Inquiry {
  id: string
  buyerId: string           // 创建者用户ID
  buyerCompany: string
  contactEmail: string
  contactPhone: string
  expectedDelivery?: string
  status: InquiryStatus
  remark?: string
  isPublic: boolean         // 是否公开询价
  createdAt: string
  updatedAt: string
  expiresAt?: string
  items: InquiryItem[]
  quotes?: InquiryQuote[]   // 关联的报价（详情时返回）
  quoteCount?: number       // 报价数量（列表时返回）
}

export interface InquiryItem {
  id: string
  inquiryId: string
  product: {
    id: string
    brand: string
    model: string
    innerDiameter: number
    outerDiameter: number
    width: number
  }
  quantity: number
  remark?: string
}
```

**Quote 类型定义：**
```typescript
// src/types/quote.ts
export type QuoteStatus =
  | 'draft'
  | 'submitted'       // 已提交
  | 'under_review'    // 审核中
  | 'accepted'        // 已接受
  | 'rejected'        // 已拒绝
  | 'expired'
  | 'withdrawn'

export interface InquiryQuote {
  id: string
  inquiryId: string
  supplierId: string
  supplierCompany: string
  supplierContact: string
  supplierPhone: string
  status: QuoteStatus
  validUntil: string
  deliveryDays: number
  paymentTerms?: string
  totalAmount: number
  remark?: string
  createdAt: string
  updatedAt: string
  items: QuoteItem[]
}

export interface QuoteItem {
  id: string
  inquiryItemId: string
  unitPrice: number
  quantity: number
  subtotal: number
  remark?: string
}
```

### 1.2 创建 Mock API 层

```
src/api/
├── inquiry.ts          # 真实 API（后续实现）
├── quote.ts            # 真实 API（后续实现）
├── market.ts           # 真实 API（后续实现）
└── mock/
    ├── inquiry.ts      # Mock 实现
    ├── quote.ts        # Mock 实现
    ├── market.ts       # Mock 实现
    └── data.ts         # Mock 数据
```

**Mock 数据生成器：**
```typescript
// src/api/mock/data.ts
import { faker } from '@faker-js/faker/locale/zh_CN'

// 生成模拟询价单
export function generateMockInquiry(overrides?: Partial<Inquiry>): Inquiry {
  return {
    id: `RFQ-${faker.date.recent().toISOString().slice(0, 10).replace(/-/g, '')}-${faker.number.int({ min: 100, max: 999 })}`,
    buyerId: faker.string.uuid(),
    buyerCompany: faker.company.name(),
    contactEmail: faker.internet.email(),
    contactPhone: faker.phone.number(),
    status: faker.helpers.arrayElement(['published', 'quoting', 'quoted']),
    isPublic: true,
    createdAt: faker.date.recent().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, generateMockInquiryItem),
    ...overrides
  }
}

// 生成模拟报价
export function generateMockQuote(overrides?: Partial<InquiryQuote>): InquiryQuote {
  return {
    id: `QUO-${faker.date.recent().toISOString().slice(0, 10).replace(/-/g, '')}-${faker.number.int({ min: 100, max: 999 })}`,
    inquiryId: faker.string.uuid(),
    supplierId: faker.string.uuid(),
    supplierCompany: faker.company.name(),
    supplierContact: faker.person.fullName(),
    supplierPhone: faker.phone.number(),
    status: faker.helpers.arrayElement(['submitted', 'under_review', 'accepted']),
    validUntil: faker.date.future().toISOString(),
    deliveryDays: faker.number.int({ min: 3, max: 30 }),
    paymentTerms: faker.helpers.arrayElement(['款到发货', '月结30天', '货到付款']),
    totalAmount: faker.number.int({ min: 1000, max: 100000 }),
    createdAt: faker.date.recent().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    items: [],
    ...overrides
  }
}
```

**Mock API 实现示例：**
```typescript
// src/api/mock/inquiry.ts
import { generateMockInquiry } from './data'
import type { Inquiry, InquiryItem } from '@/types/inquiry'

// 内存存储
let mockInquiries: Inquiry[] = Array.from({ length: 5 }, () => generateMockInquiry())

export const inquiryApi = {
  // 获取我的询价单
  async getMyInquiries(): Promise<Inquiry[]> {
    await delay(500)
    const currentUserId = getCurrentUserId()
    return mockInquiries.filter(i => i.buyerId === currentUserId)
  },

  // 创建询价单
  async createInquiry(data: CreateInquiryRequest): Promise<Inquiry> {
    await delay(800)
    const inquiry = generateMockInquiry({
      ...data,
      buyerId: getCurrentUserId(),
      status: 'draft'
    })
    mockInquiries.unshift(inquiry)
    return inquiry
  },

  // 发布询价单
  async publishInquiry(id: string): Promise<void> {
    await delay(500)
    const inquiry = mockInquiries.find(i => i.id === id)
    if (inquiry) inquiry.status = 'published'
  },

  // ... 其他方法
}

// 辅助函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const getCurrentUserId = () => 'current-user-id' // 从 localStorage 或 auth store 获取
```

### 1.3 API 切换机制

```typescript
// src/api/index.ts
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const inquiryApi = USE_MOCK 
  ? (await import('./mock/inquiry')).inquiryApi
  : (await import('./inquiry')).inquiryApi

export const quoteApi = USE_MOCK
  ? (await import('./mock/quote')).quoteApi
  : (await import('./quote')).quoteApi

export const marketApi = USE_MOCK
  ? (await import('./mock/market')).marketApi
  : (await import('./market')).marketApi
```

**.env 配置：**
```bash
# 使用 Mock API
VITE_USE_MOCK=true

# 使用真实 API（后端就绪后切换）
# VITE_USE_MOCK=false
```

---

## 第二阶段：询价单功能重构（1 天）

### 2.1 更新 Inquiry.vue 页面

**变更点：**
- [ ] 移除 `saveInquiryHistory` 本地存储逻辑
- [ ] 使用 `inquiryApi.createInquiry()` 创建询价单
- [ ] 创建成功后跳转到用户中心的"我的询价单"
- [ ] 提交时显示加载状态

**代码结构：**
```typescript
// src/views/Inquiry.vue
import { inquiryApi } from '@/api'

const handleSubmit = async () => {
  submitting.value = true
  try {
    const inquiry = await inquiryApi.createInquiry({
      items: items.value,
      remark: remark.value
    })
    message.success(`询价单 ${inquiry.id} 已创建`)
    clearInquiry()
    router.push('/user/inquiries')
  } finally {
    submitting.value = false
  }
}
```

### 2.2 更新 UserCenter.vue - 我的询价单

**变更点：**
- [ ] 从 API 获取询价单列表
- [ ] 显示询价单状态（带颜色标签）
- [ ] 添加"发布"操作按钮（草稿状态）
- [ ] 点击查看详情

**新增字段显示：**
```vue
<a-table :dataSource="inquiries" :columns="columns">
  <template #bodyCell="{ column, record }">
    <template v-if="column.key === 'status'">
      <a-tag :color="getStatusColor(record.status)">
        {{ getStatusText(record.status) }}
      </a-tag>
    </template>
    <template v-else-if="column.key === 'quoteCount'">
      <a-badge :count="record.quoteCount" :showZero="true" />
    </template>
    <template v-else-if="column.key === 'action'">
      <a-button v-if="record.status === 'draft'" @click="publish(record.id)">
        发布
      </a-button>
      <a-button type="link" @click="viewDetail(record.id)">查看</a-button>
    </template>
  </template>
</a-table>
```

### 2.3 创建 InquiryDetail.vue（买家视角）

**功能：**
- [ ] 显示询价单基本信息
- [ ] 产品列表
- [ ] **新增：收到的报价列表（Tab 切换）**
- [ ] 接受/拒绝报价按钮

---

## 第三阶段：市场功能开发（1 天）

### 3.1 创建 MarketInquiries.vue（可报价市场）

**功能：**
- [ ] 列表显示所有公开询价单（排除自己的）
- [ ] 搜索/筛选（品牌、关键字）
- [ ] 点击卡片查看详情

**Mock 数据特点：**
- 生成的询价单 buyerId 随机，确保不会全是自己的
- 包含各种状态的询价单，但只显示 `published` 和 `quoting`

### 3.2 创建 MarketInquiryDetail.vue

**功能：**
- [ ] 询价单详情（只读）
- [ ] 判断是否是自已的询价单（是则显示"这是您的询价单"）
- [ ] "我要报价"按钮（点击进入报价页）
- [ ] 已报价提示（显示"您已提交报价"+查看链接）

### 3.3 创建 QuoteSubmit.vue（提交报价）

**功能：**
- [ ] 显示询价单产品列表
- [ ] 为每个产品输入单价
- [ ] 自动计算小计和总价
- [ ] 填写交货周期、付款条款、备注
- [ ] 提交报价

**表单结构：**
```typescript
interface QuoteForm {
  inquiryId: string
  items: {
    inquiryItemId: string
    unitPrice: number
    remark?: string
  }[]
  validUntil: string
  deliveryDays: number
  paymentTerms?: string
  remark?: string
}
```

---

## 第四阶段：我的报价功能（0.5 天）

### 4.1 创建 MyQuotes.vue

**功能：**
- [ ] 我提交的所有报价列表
- [ ] 状态筛选（已提交/被接受/被拒绝）
- [ ] 关联的询价单信息（单号、产品数量）
- [ ] 点击查看详情

### 4.2 创建 QuoteDetail.vue

**功能：**
- [ ] 报价详情（价格、交货期等）
- [ ] 关联的询价单信息
- [ ] 状态历史
- [ ] 撤回按钮（仅在 submitted 状态）

---

## 第五阶段：用户中心重构（0.5 天）

### 5.1 用户中心布局调整

**新结构：**
```
用户中心 (/user/profile)
├── 概览卡片（显示统计信息）
│   ├── 我的询价单数量
│   ├── 收到的报价数量
│   ├── 我的报价数量
│   └── 成交订单数量
│
├── 我的采购
│   └── 我的询价单列表入口
│
└── 我的销售
    ├── 可报价市场入口
    └── 我的报价列表入口
```

### 5.2 新增路由

```typescript
// src/router/index.ts
const routes = [
  // 原有路由...
  
  // 用户中心相关
  { path: '/user/inquiries', component: () => import('@/views/user/MyInquiries.vue') },
  { path: '/user/inquiries/:id', component: () => import('@/views/user/InquiryDetail.vue') },
  { path: '/user/quotes', component: () => import('@/views/user/MyQuotes.vue') },
  { path: '/user/quotes/:id', component: () => import('@/views/user/QuoteDetail.vue') },
  
  // 市场相关
  { path: '/market/inquiries', component: () => import('@/views/market/MarketInquiries.vue') },
  { path: '/market/inquiries/:id', component: () => import('@/views/market/MarketInquiryDetail.vue') },
  { path: '/market/inquiries/:id/quote', component: () => import('@/views/market/QuoteSubmit.vue') },
]
```

---

## 第六阶段：导航和入口调整（0.5 天）

### 6.1 AppHeader 更新

**变更：**
- [ ] 保留"产品列表"、"询价单"导航
- [ ] **新增"市场"导航**（指向 /market/inquiries）
- [ ] 点击用户名进入用户中心

### 6.2 快捷入口

- [ ] 询价单页面：空状态时引导"去市场看看"
- [ ] 用户中心：明显的买卖双入口

---

## Mock 数据设计

### 模拟多用户场景

为了让前端开发时能测试"不能自报价"等逻辑，Mock 数据需要模拟多用户：

```typescript
// src/api/mock/data.ts

// 模拟用户池
const MOCK_USERS = [
  { id: 'user-1', company: '上海轴承有限公司', email: 'user1@example.com' },
  { id: 'user-2', company: '北京机械制造厂', email: 'user2@example.com' },
  { id: 'user-3', company: '广州工业设备公司', email: 'user3@example.com' },
]

// 当前用户（模拟登录）
export const CURRENT_USER = MOCK_USERS[0]

// 生成询价单时随机分配买家（但有一定概率是 current user）
export function generateMockInquiry(): Inquiry {
  const isMine = Math.random() < 0.3  // 30% 概率是自己的
  const buyer = isMine ? CURRENT_USER : faker.helpers.arrayElement(MOCK_USERS)
  
  return {
    buyerId: buyer.id,
    buyerCompany: buyer.company,
    // ...
  }
}
```

### 模拟权限控制

```typescript
// 在 Mock API 中实现与后端相同的权限校验
export const marketApi = {
  async getAvailableInquiries(): Promise<Inquiry[]> {
    // 过滤掉自己的询价单
    return mockInquiries.filter(i => 
      i.status === 'published' && 
      i.buyerId !== CURRENT_USER.id
    )
  }
}

export const quoteApi = {
  async submitQuote(data: QuoteForm): Promise<void> {
    // 检查是否是自己的询价单
    const inquiry = mockInquiries.find(i => i.id === data.inquiryId)
    if (inquiry?.buyerId === CURRENT_USER.id) {
      throw new Error('不能对自己的询价单进行报价')
    }
    // ...
  }
}
```

---

## 开发顺序建议

### Day 1（基础设施）
1. 创建类型定义文件
2. 安装 faker-js（生成 Mock 数据）
3. 创建 Mock API 基础框架
4. 配置 VITE_USE_MOCK 环境变量

### Day 2（询价单重构）
1. 更新 useInquiry（移除 localStorage，改为内存存储）
2. 更新 Inquiry.vue（使用 API 创建询价单）
3. 更新 UserCenter（我的询价单列表）
4. 创建 InquiryDetail（买家视角，含报价列表）

### Day 3（市场功能）
1. 创建 MarketInquiries（可报价列表）
2. 创建 MarketInquiryDetail（询价单详情）
3. 创建 QuoteSubmit（提交报价表单）

### Day 4（我的报价 + 用户中心）
1. 创建 MyQuotes（我的报价列表）
2. 创建 QuoteDetail（报价详情）
3. 重构 UserCenter（买卖双入口布局）

### Day 5（整合测试）
1. 更新 AppHeader（添加市场入口）
2. 完整流程测试
3. 边界情况测试（自报价拦截等）

---

## 后端对接准备

### API 接口契约

Mock API 的设计已遵循 RESTful 规范，后端实现时保持相同接口：

| Mock 接口 | 后端实现 | 说明 |
|-----------|----------|------|
| `GET /api/inquiries/my` | 相同 | 获取我的询价单 |
| `POST /api/inquiries` | 相同 | 创建询价单 |
| `POST /api/inquiries/:id/publish` | 相同 | 发布询价单 |
| `GET /api/market/inquiries` | 相同 | 可报价市场 |
| `POST /api/quotes` | 相同 | 提交报价 |
| `GET /api/quotes/my` | 相同 | 我的报价 |

### 切换步骤

1. 后端 API 就绪后，修改 `.env`：
   ```bash
   VITE_USE_MOCK=false
   ```

2. 实现真实 API 文件：
   ```typescript
   // src/api/inquiry.ts
   import axios from 'axios'
   
   export const inquiryApi = {
     async getMyInquiries() {
       const { data } = await axios.get('/api/inquiries/my')
       return data
     },
     // ...
   }
   ```

3. 无需修改页面代码，自动切换到真实 API

---

## 关键检查点

- [ ] Mock 数据能正确模拟"不能自报价"场景
- [ ] 状态流转符合设计文档
- [ ] 加载状态和错误处理完善
- [ ] 切换 Mock/真实 API 只需改环境变量
