/**
 * 报价单 Mock API
 */

import { mockStorage, delay, generateId } from './data'
import type {
  InquiryQuote,
  SubmitQuoteRequest,
  UpdateQuoteRequest,
  QuoteListQuery,
  AcceptQuoteRequest,
  RejectQuoteRequest,
} from '@/types/quote'
import type { PaginatedResponse } from '@/types/api'

export const quoteApi = {
  // 获取我的报价列表
  async getMyQuotes(query?: QuoteListQuery): Promise<PaginatedResponse<InquiryQuote>> {
    await delay(500)

    const currentUserId = mockStorage.getCurrentUserId()
    let items = mockStorage.quotes.filter(q => q.supplierId === currentUserId)

    // 状态筛选
    if (query?.status) {
      items = items.filter(q => q.status === query.status)
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

  // 获取报价详情
  async getQuote(id: string): Promise<InquiryQuote> {
    await delay(400)

    const quote = mockStorage.quotes.find(q => q.id === id)
    if (!quote) {
      throw new Error('报价单不存在')
    }

    // 检查权限：只能看自己的报价或询价单创建者看收到的报价
    const currentUserId = mockStorage.getCurrentUserId()
    const inquiry = mockStorage.inquiries.find(i => i.id === quote.inquiryId)

    if (quote.supplierId !== currentUserId && inquiry?.buyerId !== currentUserId) {
      throw new Error('无权查看此报价')
    }

    return quote
  },

  // 提交报价
  async submitQuote(data: SubmitQuoteRequest): Promise<InquiryQuote> {
    await delay(800)

    const currentUser = mockStorage.getCurrentUser()
    const inquiry = mockStorage.inquiries.find(i => i.id === data.inquiryId)

    if (!inquiry) {
      throw new Error('询价单不存在')
    }

    // 校验：不能给自己的询价单报价
    if (inquiry.buyerId === currentUser.id) {
      throw new Error('不能对自己的询价单进行报价')
    }

    // 校验：询价单状态必须是 published 或 quoting
    if (!['published', 'quoting'].includes(inquiry.status)) {
      throw new Error('该询价单已停止接收报价')
    }

    // 校验：是否已经报过价
    const existingQuote = mockStorage.quotes.find(
      q => q.inquiryId === data.inquiryId && q.supplierId === currentUser.id
    )
    if (existingQuote) {
      throw new Error('您已经对该询价单提交过报价')
    }

    // 校验：报价有效期
    const validUntil = new Date(data.validUntil)
    if (validUntil <= new Date()) {
      throw new Error('报价有效期必须大于当前时间')
    }

    // 校验：所有询价单项都必须有报价
    const inquiryItemIds = inquiry.items.map(item => item.id)
    const quoteItemIds = data.items.map(item => item.inquiryItemId)
    const missingItems = inquiryItemIds.filter(id => !quoteItemIds.includes(id))
    if (missingItems.length > 0) {
      throw new Error('必须为所有产品提交报价')
    }

    // 计算总价
    const items = data.items.map((item: { inquiryItemId: string; unitPrice: number; remark?: string }) => {
      const inquiryItem = inquiry.items.find((i: { id: string; quantity: number }) => i.id === item.inquiryItemId)
      return {
        id: `quote-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        inquiryItemId: item.inquiryItemId,
        unitPrice: item.unitPrice,
        quantity: inquiryItem?.quantity || 0,
        subtotal: item.unitPrice * (inquiryItem?.quantity || 0),
        remark: item.remark,
      }
    })

    const totalAmount = items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0)

    const quote: InquiryQuote = {
      id: generateId('QUO'),
      inquiryId: data.inquiryId,
      supplierId: currentUser.id,
      supplierCompany: currentUser.company,
      supplierContact: currentUser.contact,
      supplierPhone: currentUser.phone,
      status: 'submitted',
      validUntil: data.validUntil,
      deliveryDays: data.deliveryDays,
      paymentTerms: data.paymentTerms,
      totalAmount,
      remark: data.remark,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items,
      inquiry: {
        id: inquiry.id,
        buyerCompany: inquiry.buyerCompany,
        status: inquiry.status,
        items: inquiry.items.map((item: { product: { brand: string; model: string }; quantity: number }) => ({
          product: {
            brand: item.product.brand,
            model: item.product.model,
          },
          quantity: item.quantity,
        })),
      },
    }

    mockStorage.quotes.push(quote)

    // 更新询价单状态为 quoting
    if (inquiry.status === 'published') {
      inquiry.status = 'quoting'
      inquiry.updatedAt = new Date().toISOString()
    }

    return quote
  },

  // 修改报价
  async updateQuote(id: string, data: UpdateQuoteRequest): Promise<InquiryQuote> {
    await delay(600)

    const currentUserId = mockStorage.getCurrentUserId()
    const quote = mockStorage.quotes.find(q => q.id === id)

    if (!quote) {
      throw new Error('报价单不存在')
    }

    if (quote.supplierId !== currentUserId) {
      throw new Error('无权修改此报价')
    }

    if (quote.status !== 'submitted') {
      throw new Error('只能修改已提交状态的报价')
    }

    const inquiry = mockStorage.inquiries.find(i => i.id === data.inquiryId)
    if (!inquiry) {
      throw new Error('询价单不存在')
    }

    // 重新计算价格
    const items = data.items.map((item: { inquiryItemId: string; unitPrice: number; remark?: string }) => {
      const inquiryItem = inquiry.items.find((i: { id: string; quantity: number }) => i.id === item.inquiryItemId)
      return {
        id: `quote-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        inquiryItemId: item.inquiryItemId,
        unitPrice: item.unitPrice,
        quantity: inquiryItem?.quantity || 0,
        subtotal: item.unitPrice * (inquiryItem?.quantity || 0),
        remark: item.remark,
      }
    })

    quote.items = items
    quote.totalAmount = items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0)
    quote.validUntil = data.validUntil
    quote.deliveryDays = data.deliveryDays
    quote.paymentTerms = data.paymentTerms
    quote.remark = data.remark
    quote.updatedAt = new Date().toISOString()

    return quote
  },

  // 撤回报价
  async withdrawQuote(id: string): Promise<void> {
    await delay(400)

    const currentUserId = mockStorage.getCurrentUserId()
    const quote = mockStorage.quotes.find(q => q.id === id)

    if (!quote) {
      throw new Error('报价单不存在')
    }

    if (quote.supplierId !== currentUserId) {
      throw new Error('无权撤回此报价')
    }

    if (quote.status !== 'submitted') {
      throw new Error('只能撤回已提交状态的报价')
    }

    quote.status = 'withdrawn'
    quote.updatedAt = new Date().toISOString()
  },

  // 接受报价（买家操作）
  async acceptQuote(inquiryId: string, quoteId: string, _data?: AcceptQuoteRequest): Promise<void> {
    await delay(500)

    const inquiry = mockStorage.inquiries.find(i => i.id === inquiryId)
    if (!inquiry) {
      throw new Error('询价单不存在')
    }

    const currentUserId = mockStorage.getCurrentUserId()
    if (inquiry.buyerId !== currentUserId) {
      throw new Error('无权操作此询价单')
    }

    const quote = mockStorage.quotes.find(q => q.id === quoteId)
    if (!quote || quote.inquiryId !== inquiryId) {
      throw new Error('报价不存在')
    }

    if (quote.status !== 'submitted') {
      throw new Error('只能接受已提交的报价')
    }

    // 更新报价状态
    quote.status = 'accepted'
    quote.updatedAt = new Date().toISOString()

    // 更新询价单状态
    inquiry.status = 'accepted'
    inquiry.updatedAt = new Date().toISOString()

    // 拒绝其他报价
    mockStorage.quotes
      .filter(q => q.inquiryId === inquiryId && q.id !== quoteId && q.status === 'submitted')
      .forEach(q => {
        q.status = 'rejected'
        q.updatedAt = new Date().toISOString()
      })
  },

  // 拒绝报价（买家操作）
  async rejectQuote(inquiryId: string, quoteId: string, _data?: RejectQuoteRequest): Promise<void> {
    await delay(400)

    const inquiry = mockStorage.inquiries.find(i => i.id === inquiryId)
    if (!inquiry) {
      throw new Error('询价单不存在')
    }

    const currentUserId = mockStorage.getCurrentUserId()
    if (inquiry.buyerId !== currentUserId) {
      throw new Error('无权操作此询价单')
    }

    const quote = mockStorage.quotes.find(q => q.id === quoteId)
    if (!quote || quote.inquiryId !== inquiryId) {
      throw new Error('报价不存在')
    }

    if (quote.status !== 'submitted') {
      throw new Error('只能拒绝已提交的报价')
    }

    quote.status = 'rejected'
    quote.updatedAt = new Date().toISOString()
  },
}
