/**
 * 报价单真实 API（待后端实现后填充）
 */

import axios from 'axios'
import type {
  InquiryQuote,
  SubmitQuoteRequest,
  UpdateQuoteRequest,
  QuoteListQuery,
  AcceptQuoteRequest,
  RejectQuoteRequest,
} from '@/types/quote'
import type { PaginatedResponse } from '@/types/api'

// TODO: 后端 API 实现后填充
export const quoteApi = {
  async getMyQuotes(query?: QuoteListQuery): Promise<PaginatedResponse<InquiryQuote>> {
    const { data } = await axios.get('/api/quotes/my', { params: query })
    return data
  },

  async getQuote(id: string): Promise<InquiryQuote> {
    const { data } = await axios.get(`/api/quotes/${id}`)
    return data
  },

  async submitQuote(data: SubmitQuoteRequest): Promise<InquiryQuote> {
    const response = await axios.post('/api/quotes', data)
    return response.data
  },

  async updateQuote(id: string, data: UpdateQuoteRequest): Promise<InquiryQuote> {
    const response = await axios.put(`/api/quotes/${id}`, data)
    return response.data
  },

  async withdrawQuote(id: string): Promise<void> {
    await axios.post(`/api/quotes/${id}/withdraw`)
  },

  async acceptQuote(inquiryId: string, quoteId: string, data?: AcceptQuoteRequest): Promise<void> {
    await axios.post(`/api/inquiries/${inquiryId}/quotes/${quoteId}/accept`, data)
  },

  async rejectQuote(inquiryId: string, quoteId: string, data?: RejectQuoteRequest): Promise<void> {
    await axios.post(`/api/inquiries/${inquiryId}/quotes/${quoteId}/reject`, data)
  },
}
