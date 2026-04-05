/**
 * 询价单 Mock API
 */

import { mockStorage, delay, generateId } from './data'
import type {
  Inquiry,
  InquiryItem,
  CreateInquiryRequest,
  PublishInquiryRequest,
  InquiryListQuery,
} from '@/types/inquiry'
import type { PaginatedResponse } from '@/types/api'

export const inquiryApi = {
  // 获取我的询价单列表
  async getMyInquiries(query?: InquiryListQuery): Promise<PaginatedResponse<Inquiry>> {
    await delay(500)

    const currentUserId = mockStorage.getCurrentUserId()
    let items = mockStorage.inquiries.filter(i => i.buyerId === currentUserId)

    // 状态筛选
    if (query?.status) {
      items = items.filter(i => i.status === query.status)
    }

    // 排序：最新的在前
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // 分页
    const page = query?.page || 1
    const pageSize = query?.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedItems = items.slice(start, end)

    return {
      items: paginatedItems,
      total: items.length,
      page,
      pageSize,
      totalPages: Math.ceil(items.length / pageSize),
    }
  },

  // 获取询价单详情
  async getInquiry(id: string): Promise<Inquiry> {
    await delay(400)

    const inquiry = mockStorage.inquiries.find(i => i.id === id)
    if (!inquiry) {
      throw new Error('询价单不存在')
    }

    // 如果是当前用户的询价单，加载报价列表
    const currentUserId = mockStorage.getCurrentUserId()
    if (inquiry.buyerId === currentUserId) {
      inquiry.quotes = mockStorage.quotes
        .filter(q => q.inquiryId === id)
        .map(q => ({
          id: q.id,
          supplierId: q.supplierId,
          supplierCompany: q.supplierCompany,
          status: q.status,
          totalAmount: q.totalAmount,
          createdAt: q.createdAt,
        }))
    }

    return inquiry
  },

  // 创建询价单
  async createInquiry(data: CreateInquiryRequest): Promise<Inquiry> {
    await delay(800)

    const currentUser = mockStorage.getCurrentUser()
    const id = generateId('RFQ')

    // 生成询价单项
    const items: InquiryItem[] = data.items.map((item: { productId: string; quantity: number; remark?: string }, index: number) => ({
      id: `item-${Date.now()}-${index}`,
      inquiryId: id,
      product: {
        id: item.productId,
        brand: 'Unknown', // 实际应该从产品服务获取
        model: 'Unknown',
        innerDiameter: 0,
        outerDiameter: 0,
        width: 0,
      },
      quantity: item.quantity,
      remark: item.remark,
    }))

    const inquiry: Inquiry = {
      id,
      buyerId: currentUser.id,
      buyerCompany: currentUser.company,
      contactEmail: data.contactEmail || currentUser.email,
      contactPhone: data.contactPhone || currentUser.phone,
      expectedDelivery: data.expectedDelivery,
      status: 'draft',
      remark: data.remark,
      isPublic: data.isPublic ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items,
      quoteCount: 0,
    }

    mockStorage.inquiries.unshift(inquiry)
    return inquiry
  },

  // 发布询价单
  async publishInquiry(id: string, data?: PublishInquiryRequest): Promise<void> {
    await delay(500)

    const inquiry = mockStorage.inquiries.find(i => i.id === id)
    if (!inquiry) {
      throw new Error('询价单不存在')
    }

    const currentUserId = mockStorage.getCurrentUserId()
    if (inquiry.buyerId !== currentUserId) {
      throw new Error('无权操作此询价单')
    }

    if (inquiry.status !== 'draft') {
      throw new Error('只能发布草稿状态的询价单')
    }

    inquiry.status = 'published'
    inquiry.expiresAt = data?.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    inquiry.updatedAt = new Date().toISOString()
  },

  // 取消询价单
  async cancelInquiry(id: string): Promise<void> {
    await delay(400)

    const inquiry = mockStorage.inquiries.find(i => i.id === id)
    if (!inquiry) {
      throw new Error('询价单不存在')
    }

    const currentUserId = mockStorage.getCurrentUserId()
    if (inquiry.buyerId !== currentUserId) {
      throw new Error('无权操作此询价单')
    }

    if (!['draft', 'published', 'quoting'].includes(inquiry.status)) {
      throw new Error('当前状态无法取消')
    }

    inquiry.status = 'cancelled'
    inquiry.updatedAt = new Date().toISOString()
  },

  // 关闭询价单（停止接收报价）
  async closeInquiry(id: string): Promise<void> {
    await delay(400)

    const inquiry = mockStorage.inquiries.find(i => i.id === id)
    if (!inquiry) {
      throw new Error('询价单不存在')
    }

    const currentUserId = mockStorage.getCurrentUserId()
    if (inquiry.buyerId !== currentUserId) {
      throw new Error('无权操作此询价单')
    }

    if (!['published', 'quoting'].includes(inquiry.status)) {
      throw new Error('当前状态无法关闭')
    }

    inquiry.status = 'quoted'
    inquiry.updatedAt = new Date().toISOString()
  },

  // 获取收到的报价列表（买家视角）
  async getInquiryQuotes(inquiryId: string) {
    await delay(400)

    const inquiry = mockStorage.inquiries.find(i => i.id === inquiryId)
    if (!inquiry) {
      throw new Error('询价单不存在')
    }

    const currentUserId = mockStorage.getCurrentUserId()
    if (inquiry.buyerId !== currentUserId) {
      throw new Error('无权查看此询价单的报价')
    }

    const quotes = mockStorage.quotes.filter(q => q.inquiryId === inquiryId)
    return quotes
  },
}
