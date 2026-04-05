/**
 * 市场 Mock API（可报价询价单）
 */

import { mockStorage, delay } from './data'
import type { Inquiry } from '@/types/inquiry'
import type { PaginatedResponse, ListQuery } from '@/types/api'

export const marketApi = {
  // 获取可报价的询价单列表（市场）
  async getAvailableInquiries(query?: ListQuery & { brand?: string }): Promise<PaginatedResponse<Inquiry>> {
    await delay(600)

    const currentUserId = mockStorage.getCurrentUserId()

    // 只返回 published 和 quoting 状态的询价单，且排除自己的
    let items = mockStorage.inquiries.filter(i =>
      (i.status === 'published' || i.status === 'quoting') &&
      i.buyerId !== currentUserId
    )

    // 品牌筛选
    if (query?.brand) {
      items = items.filter(i =>
        i.items.some((item: { product: { brand: string } }) =>
          item.product.brand.toLowerCase() === query.brand!.toLowerCase()
        )
      )
    }

    // 关键字搜索
    if (query?.keyword) {
      const keyword = query.keyword.toLowerCase()
      items = items.filter(i =>
        i.id.toLowerCase().includes(keyword) ||
        i.buyerCompany.toLowerCase().includes(keyword) ||
        i.items.some((item: { product: { model: string; brand: string } }) =>
          item.product.model.toLowerCase().includes(keyword) ||
          item.product.brand.toLowerCase().includes(keyword)
        )
      )
    }

    // 排序
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

  // 获取市场询价单详情（供应商视角）
  async getMarketInquiry(id: string): Promise<Inquiry & { hasQuoted: boolean }> {
    await delay(400)

    const inquiry = mockStorage.inquiries.find(i => i.id === id)
    if (!inquiry) {
      throw new Error('询价单不存在')
    }

    const currentUserId = mockStorage.getCurrentUserId()

    // 不能查看自己的询价单
    if (inquiry.buyerId === currentUserId) {
      throw new Error('不能查看自己的询价单')
    }

    // 只能查看 published 和 quoting 状态的询价单
    if (!['published', 'quoting'].includes(inquiry.status)) {
      throw new Error('该询价单已停止接收报价')
    }

    // 检查是否已报价
    const hasQuoted = mockStorage.quotes.some(
      q => q.inquiryId === id && q.supplierId === currentUserId
    )

    return {
      ...inquiry,
      hasQuoted,
    }
  },

  // 检查是否可以报价
  async canQuote(inquiryId: string): Promise<{ canQuote: boolean; reason?: string }> {
    await delay(200)

    const inquiry = mockStorage.inquiries.find(i => i.id === inquiryId)
    if (!inquiry) {
      return { canQuote: false, reason: '询价单不存在' }
    }

    const currentUserId = mockStorage.getCurrentUserId()

    if (inquiry.buyerId === currentUserId) {
      return { canQuote: false, reason: '不能对自己的询价单进行报价' }
    }

    if (!['published', 'quoting'].includes(inquiry.status)) {
      return { canQuote: false, reason: '该询价单已停止接收报价' }
    }

    const hasQuoted = mockStorage.quotes.some(
      q => q.inquiryId === inquiryId && q.supplierId === currentUserId
    )
    if (hasQuoted) {
      return { canQuote: false, reason: '您已经对该询价单提交过报价' }
    }

    return { canQuote: true }
  },
}
