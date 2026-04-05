/**
 * API 通用类型定义
 */

// 通用 API 响应
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页请求参数
export interface PaginationQuery {
  page?: number
  pageSize?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// API 错误
export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

// 列表查询通用参数
export interface ListQuery extends PaginationQuery {
  keyword?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 操作结果
export interface OperationResult {
  success: boolean
  message?: string
  id?: string
}
