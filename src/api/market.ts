/**
 * 市场真实 API（待后端实现后填充）
 */

import axios from 'axios'
import type { Inquiry } from '@/types/inquiry'
import type { PaginatedResponse, ListQuery } from '@/types/api'

// TODO: 后端 API 实现后填充
export const marketApi = {
  async getAvailableInquiries(query?: ListQuery & { brand?: string }): Promise<PaginatedResponse<Inquiry>> {
    const { data } = await axios.get('/api/market/inquiries', { params: query })
    return data
  },

  async getMarketInquiry(id: string): Promise<Inquiry & { hasQuoted: boolean }> {
    const { data } = await axios.get(`/api/market/inquiries/${id}`)
    return data
  },

  async canQuote(inquiryId: string): Promise<{ canQuote: boolean; reason?: string }> {
    const { data } = await axios.get(`/api/market/inquiries/${inquiryId}/can-quote`)
    return data
  },
}
