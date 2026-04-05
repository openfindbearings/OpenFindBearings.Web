/**
 * 询价单类型定义
 */

// 询价单状态
export type InquiryStatus =
  | 'draft'           // 草稿
  | 'published'       // 已发布，等待报价
  | 'quoting'         // 报价中（已有供应商报价）
  | 'quoted'          // 报价完成（买家停止接收报价）
  | 'accepted'        // 已接受报价
  | 'rejected'        // 已拒绝报价
  | 'expired'         // 已过期
  | 'cancelled'       // 已取消

// 询价单项
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

// 询价单
export interface Inquiry {
  id: string
  buyerId: string              // 创建者用户ID
  buyerCompany: string
  contactEmail: string
  contactPhone: string
  expectedDelivery?: string    // 期望交期
  status: InquiryStatus
  remark?: string
  isPublic: boolean            // 是否公开询价
  createdAt: string
  updatedAt: string
  expiresAt?: string           // 报价截止日
  items: InquiryItem[]
  quotes?: InquiryQuoteSummary[]  // 关联的报价摘要（详情时返回）
  quoteCount?: number          // 报价数量（列表时返回）
}

// 询价单报价摘要（用于列表展示）
export interface InquiryQuoteSummary {
  id: string
  supplierId: string
  supplierCompany: string
  status: string
  totalAmount: number
  createdAt: string
}

// 创建询价单请求
export interface CreateInquiryRequest {
  items: {
    productId: string
    quantity: number
    remark?: string
  }[]
  remark?: string
  expectedDelivery?: string
  contactEmail?: string
  contactPhone?: string
  isPublic?: boolean
}

// 发布询价单请求
export interface PublishInquiryRequest {
  expiresAt?: string
}

// 询价单列表查询参数
export interface InquiryListQuery {
  status?: InquiryStatus
  page?: number
  pageSize?: number
}
