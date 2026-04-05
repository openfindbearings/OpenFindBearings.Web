/**
 * 询价单真实 API（待后端实现后填充）
 */

import axios from 'axios'
import type {
  Inquiry,
  CreateInquiryRequest,
  PublishInquiryRequest,
  InquiryListQuery,
} from '@/types/inquiry'
import type { PaginatedResponse } from '@/types/api'

// TODO: 后端 API 实现后填充
export const inquiryApi = {
  async getMyInquiries(query?: InquiryListQuery): Promise<PaginatedResponse<Inquiry>> {
    const { data } = await axios.get('/api/inquiries/my', { params: query })
    return data
  },

  async getInquiry(id: string): Promise<Inquiry> {
    const { data } = await axios.get(`/api/inquiries/${id}`)
    return data
  },

  async createInquiry(data: CreateInquiryRequest): Promise<Inquiry> {
    const response = await axios.post('/api/inquiries', data)
    return response.data
  },

  async publishInquiry(id: string, data?: PublishInquiryRequest): Promise<void> {
    await axios.post(`/api/inquiries/${id}/publish`, data)
  },

  async cancelInquiry(id: string): Promise<void> {
    await axios.post(`/api/inquiries/${id}/cancel`)
  },

  async closeInquiry(id: string): Promise<void> {
    await axios.post(`/api/inquiries/${id}/close`)
  },

  async getInquiryQuotes(inquiryId: string) {
    const { data } = await axios.get(`/api/inquiries/${inquiryId}/quotes`)
    return data
  },
}
