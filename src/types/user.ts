/**
 * 用户类型定义
 */

// 用户角色（可选，用于后期扩展）
export type UserRole = 'user' | 'verified_supplier' | 'admin'

// 用户信息
export interface User {
  id: string
  email: string
  username: string
  company: string
  phone?: string
  roles?: UserRole[]
  createdAt?: string
}

// 登录请求
export interface LoginRequest {
  email: string
  password: string
}

// 注册请求
export interface RegisterRequest {
  email: string
  password: string
  company: string
  username?: string
}

// 认证响应
export interface AuthResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

// 当前用户信息响应
export interface UserProfile {
  id: string
  email: string
  username: string
  company: string
  phone?: string
  // 统计信息
  stats?: {
    inquiryCount: number
    receivedQuoteCount: number
    submittedQuoteCount: number
    acceptedQuoteCount: number
  }
}
