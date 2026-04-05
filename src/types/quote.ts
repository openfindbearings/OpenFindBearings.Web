/**
 * 报价单类型定义
 */

import type { InquiryStatus } from './inquiry'

// 报价状态
export type QuoteStatus =
  | 'draft'           // 草稿
  | 'submitted'       // 已提交
  | 'under_review'    // 审核中
  | 'accepted'        // 已接受
  | 'rejected'        // 已拒绝
  | 'expired'         // 已过期
  | 'withdrawn'       // 已撤回

// 报价单项
export interface QuoteItem {
  id: string
  inquiryItemId: string
  unitPrice: number
  quantity: number
  subtotal: number
  remark?: string
}

// 报价单
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
  // 关联的询价单信息（详情时返回）
  inquiry?: {
    id: string
    buyerCompany: string
    status: InquiryStatus
    items: {
      product: {
        brand: string
        model: string
      }
      quantity: number
    }[]
  }
}

// 提交报价请求
export interface SubmitQuoteRequest {
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

// 更新报价请求
export interface UpdateQuoteRequest extends SubmitQuoteRequest {}

// 报价列表查询参数
export interface QuoteListQuery {
  status?: QuoteStatus
  page?: number
  pageSize?: number
}

// 接受/拒绝报价请求
export interface AcceptQuoteRequest {
  remark?: string
}

export interface RejectQuoteRequest {
  reason?: string
}
