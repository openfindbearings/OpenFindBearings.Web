# 供应商报价系统设计方案

## 概述

为 B2B 轴承采购平台设计的询价报价（RFQ - Request for Quotation）系统，连接买家（采购商）和卖家（供应商），实现完整的在线询价报价流程。

**设计演进说明**：采用角色合并模式，每个注册用户既是买家又是供应商，无需区分角色，通过业务规则限制（如不能自报价）保证流程合理性。

---

## 1. 角色与权限模型

### 1.1 设计方案：角色合并（推荐）

取消传统的 Buyer/Supplier 角色区分，**所有注册用户默认具备买卖双方权限**，通过业务规则控制操作边界。

#### 权限规则表

| 功能 | 权限规则 | 说明 |
|------|----------|------|
| 创建询价单 | 登录用户均可 | 任何注册用户都可发布采购需求 |
| 查看"我的询价单" | buyerId == currentUserId | 只能看到自己创建的询价单 |
| 查看"可报价列表" | 登录用户均可 | 系统自动排除自己发布的询价单 |
| 提交报价 | 不能给自己的询价单报价 | inquiry.buyerId != currentUserId |
| 查看报价详情 | 询价单创建者可见所有报价 | 报价者只能查看自己的报价 |
| 接受/拒绝报价 | 仅限询价单创建者 | buyerId == currentUserId |
| 修改/撤回报价 | 仅限报价提交者 | supplierId == currentUserId |

#### 核心校验规则

```typescript
// 1. 不能给自己的询价单报价
if (inquiry.buyerId === currentUser.id) {
  throw new Error('不能对自己的询价单进行报价')
}

// 2. 查看可报价列表时排除自己的
const getAvailableInquiries = async () => {
  return await db.inquiries
    .where('status', 'in', ['published', 'quoting'])
    .where('buyerId', '!=', currentUser.id)  // 排除自己的
    .get()
}
```

### 1.2 备选方案：传统角色分离

如需后期引入角色区分，可采用以下扩展方式：

| 角色 | 说明 | 权限 |
|------|------|------|
| User | 普通用户（默认） | 同时具备买卖权限 |
| VerifiedSupplier | 认证供应商 | 额外的信誉标识、优先展示 |
| Admin | 平台管理员 | 管理所有数据 |

---

## 2. 数据模型设计

---

## 2. 数据模型设计

### 2.1 Inquiry（询价单）扩展

```typescript
interface Inquiry {
  id: string                    // 询价单号，如 RFQ-20250403-001
  buyerId: string              // 买家用户ID
  buyerCompany: string         // 买家公司名称
  contactEmail: string
  contactPhone: string
  expectedDelivery?: string    // 期望交期
  status: InquiryStatus        // 询价单状态
  remark?: string              // 备注
  createdAt: string
  updatedAt: string
  expiresAt?: string           // 报价截止日
  items: InquiryItem[]
  quotes?: InquiryQuote[]      // 关联的报价列表
}

type InquiryStatus =
  | 'draft'           // 草稿
  | 'published'       // 已发布，等待报价
  | 'quoting'         // 报价中（已有供应商报价）
  | 'quoted'          // 报价完成（买家停止接收报价）
  | 'accepted'        // 已接受报价
  | 'rejected'        // 已拒绝报价
  | 'expired'         // 已过期
  | 'cancelled'       // 已取消

interface InquiryItem {
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
  remark?: string              // 买家对该产品的备注
}
```

### 2.2 InquiryQuote（报价单）

```typescript
interface InquiryQuote {
  id: string                   // 报价单号，如 QUO-20250403-001
  inquiryId: string            // 关联的询价单ID
  supplierId: string           // 供应商用户ID
  supplierCompany: string      // 供应商公司名称
  supplierContact: string      // 供应商联系人
  supplierPhone: string        // 供应商电话
  status: QuoteStatus          // 报价状态
  validUntil: string           // 报价有效期
  deliveryDays: number         // 交货周期（天）
  paymentTerms?: string        // 付款条款
  remark?: string              // 供应商备注
  createdAt: string
  updatedAt: string
  items: QuoteItem[]
}

type QuoteStatus =
  | 'draft'           // 草稿
  | 'submitted'       // 已提交
  | 'under_review'    // 买家审核中
  | 'accepted'        // 已接受
  | 'rejected'        // 已拒绝
  | 'expired'         // 已过期
  | 'withdrawn'       // 已撤回

interface QuoteItem {
  id: string
  inquiryItemId: string        // 关联的询价单项ID
  unitPrice: number            // 单价
  quantity: number             // 数量（应与询价单一致）
  subtotal: number             // 小计（unitPrice * quantity）
  remark?: string              // 该项备注（如特殊说明）
}
```

---

## 3. API 接口设计

### 3.1 询价单相关接口（买方操作）

```typescript
// 创建询价单
POST /api/inquiries
Body: { items: InquiryItem[], remark?: string, expectedDelivery?: string }

// 获取我的询价单列表
GET /api/inquiries/my
Query: { status?: InquiryStatus, page?: number, pageSize?: number }

// 获取询价单详情
GET /api/inquiries/:id

// 发布询价单（从草稿进入 published 状态）
POST /api/inquiries/:id/publish

// 获取收到的报价列表
GET /api/inquiries/:id/quotes

// 查看报价详情
GET /api/inquiries/:id/quotes/:quoteId

// 接受报价
POST /api/inquiries/:id/quotes/:quoteId/accept
Body: { remark?: string }

// 拒绝报价
POST /api/inquiries/:id/quotes/:quoteId/reject
Body: { reason?: string }

// 停止接收报价（进入 quoted 状态）
POST /api/inquiries/:id/close

// 取消询价单
POST /api/inquiries/:id/cancel
```

### 3.2 报价相关接口（卖方操作）

```typescript
// 获取可报价的询价单列表（市场）
// 自动排除自己发布的询价单
GET /api/market/inquiries
Query: { page?: number, pageSize?: number, brand?: string, keyword?: string }

// 获取可报价询价单详情
GET /api/market/inquiries/:id

// 提交报价
POST /api/quotes
Body: {
  inquiryId: string
  validUntil: string
  deliveryDays: number
  paymentTerms?: string
  remark?: string
  items: {
    inquiryItemId: string
    unitPrice: number
    remark?: string
  }[]
}

// 获取我的报价列表
GET /api/quotes/my
Query: { status?: QuoteStatus, page?: number, pageSize?: number }

// 获取报价详情
GET /api/quotes/:id

// 修改报价（仅在 submitted 状态下可修改）
PUT /api/quotes/:id
Body: { /* 同提交报价 */ }

// 撤回报价
POST /api/quotes/:id/withdraw
```

---

## 4. 业务逻辑规则

### 4.1 报价提交验证

1. **完整性验证**：报价必须包含询价单中所有产品项
2. **价格验证**：单价必须 > 0
3. **数量验证**：报价数量必须等于询价数量（不允许分批报价）
4. **有效期验证**：validUntil 必须大于当前时间
5. **时间窗口验证**：询价单状态必须为 published 或 quoting
6. **重复报价验证**：同一供应商对同一询价单只能有一个有效报价

### 4.2 报价状态流转

```
draft -> submitted -> under_review -> accepted
                         |
                         v
                    rejected / expired / withdrawn
```

### 4.3 询价单状态流转

```
draft -> published -> quoting -> quoted -> accepted
                         |
                         v
                    expired / cancelled
```

### 4.4 报价比较逻辑

买家查看多个报价时，系统提供对比功能：
- 按总价排序
- 按交货周期排序
- 按供应商信誉排序
- 高亮显示最优价格项

---

## 5. 前端页面设计

### 5.1 用户中心页面结构

用户中心分为两大板块，通过 TAB 切换：

```
用户中心 (/user/profile)
├── 我的采购 (buyer)
│   └── 我的询价单 (/user/inquiries)
│       ├── 询价单列表（状态筛选）
│       └── 询价单详情（含收到的报价列表）
│
└── 我的销售 (supplier)
    ├── 可报价市场 (/market/inquiries)
    │   ├── 市场列表
    │   └── 报价录入
    └── 我的报价 (/user/quotes)
        └── 报价列表及详情
```

### 5.2 页面路由定义

| 页面 | 路径 | 说明 |
|------|------|------|
| **用户中心** | /user/profile | 入口页，显示买卖双方的汇总信息 |
| **我的采购** | | |
| 我的询价单 | /user/inquiries | 我发布的询价单列表 |
| 询价单详情 | /user/inquiries/:id | 询价单详情，含"收到的报价"标签页 |
| 报价对比 | /user/inquiries/:id/quotes | 显示所有报价的对比视图 |
| **我的销售** | | |
| 可报价市场 | /market/inquiries | 可报价的询价单列表（排除自己的） |
| 询价单详情 | /market/inquiries/:id | 查看详情，提供"我要报价"按钮 |
| 报价录入 | /market/inquiries/:id/quote | 填写报价表单 |
| 我的报价 | /user/quotes | 我提交的所有报价列表 |
| 报价详情 | /user/quotes/:id | 查看已提交报价的详情和状态 |

---

## 6. 数据库 Schema（简化）

```sql
-- 询价表
CREATE TABLE Inquiries (
    Id NVARCHAR(50) PRIMARY KEY,
    BuyerId NVARCHAR(450) NOT NULL,
    BuyerCompany NVARCHAR(200),
    ContactEmail NVARCHAR(100),
    ContactPhone NVARCHAR(50),
    ExpectedDelivery DATE,
    Status INT NOT NULL,  -- 枚举值
    Remark NVARCHAR(1000),
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL,
    ExpiresAt DATETIME2,
    IsPublic BIT DEFAULT 1  -- 是否公开询价
);

-- 询价产品项表
CREATE TABLE InquiryItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    InquiryId NVARCHAR(50) NOT NULL,
    ProductId UNIQUEIDENTIFIER NOT NULL,
    Quantity INT NOT NULL,
    Remark NVARCHAR(500),
    FOREIGN KEY (InquiryId) REFERENCES Inquiries(Id)
);

-- 报价表
CREATE TABLE InquiryQuotes (
    Id NVARCHAR(50) PRIMARY KEY,
    InquiryId NVARCHAR(50) NOT NULL,
    SupplierId NVARCHAR(450) NOT NULL,
    SupplierCompany NVARCHAR(200),
    SupplierContact NVARCHAR(100),
    SupplierPhone NVARCHAR(50),
    Status INT NOT NULL,
    ValidUntil DATETIME2 NOT NULL,
    DeliveryDays INT NOT NULL,
    PaymentTerms NVARCHAR(200),
    TotalAmount DECIMAL(18,2) NOT NULL,
    Remark NVARCHAR(1000),
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NOT NULL,
    FOREIGN KEY (InquiryId) REFERENCES Inquiries(Id)
);

-- 报价产品项表
CREATE TABLE QuoteItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    QuoteId NVARCHAR(50) NOT NULL,
    InquiryItemId UNIQUEIDENTIFIER NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    Quantity INT NOT NULL,
    Subtotal DECIMAL(18,2) NOT NULL,
    Remark NVARCHAR(500),
    FOREIGN KEY (QuoteId) REFERENCES InquiryQuotes(Id)
);

-- 供应商授权表（哪些供应商可以查看/报价）
CREATE TABLE InquirySupplierAccess (
    InquiryId NVARCHAR(50) NOT NULL,
    SupplierId NVARCHAR(450) NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    PRIMARY KEY (InquiryId, SupplierId),
    FOREIGN KEY (InquiryId) REFERENCES Inquiries(Id)
);
```

---

## 7. 实现优先级建议

### Phase 1：核心功能（MVP）
1. **扩展 Inquiry 模型**
   - 添加 `buyerId` 关联当前用户
   - 添加 `status` 状态字段
2. **创建 Quote 数据模型和数据库表**
   - InquiryQuote 主表
   - QuoteItem 明细表
3. **实现买方基础功能**
   - 创建询价单
   - 查看我的询价单列表
4. **实现卖方基础功能**
   - 可报价市场列表（排除自己的）
   - 提交报价（含自报价校验）

### Phase 2：报价管理
1. **买方功能**
   - 查看收到的报价列表
   - 接受/拒绝报价
2. **卖方功能**
   - 我的报价列表
   - 撤回/修改报价
3. **通用功能**
   - 报价对比视图

### Phase 3：高级功能
1. 定向询价（指定供应商可见）
2. 报价过期自动处理
3. 询价单搜索和筛选
4. 报价历史和分析统计

---

## 8. 安全考虑

1. **数据隔离**：供应商只能看到自己提交的报价，不能看到其他供应商的报价
2. **权限验证**：每个 API 端点都要验证用户角色和所有权
3. **防篡改**：报价提交后原则上不可修改（或仅限特定状态）
4. **审计日志**：记录所有报价操作（提交、修改、接受、拒绝）
