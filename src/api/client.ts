import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { refreshToken, tokenStorage } from './auth'

const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000')

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 是否正在刷新 token
let isRefreshing = false
// 刷新队列
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

// 请求拦截器 - 添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理 401 自动刷新
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // 如果是 401 且不是刷新 token 的请求
    if (error.response?.status === 401 && !originalRequest.url?.includes('/connect/token')) {
      const refreshTokenValue = tokenStorage.getRefreshToken()

      if (!refreshTokenValue) {
        // 没有 refresh token，跳转到登录
        tokenStorage.clearTokens()
        window.location.href = '/#/user/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // 正在刷新，加入队列等待
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const data = await refreshToken(refreshTokenValue)
        tokenStorage.setTokens(data.access_token, data.refresh_token)
        onTokenRefreshed(data.access_token)
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // 刷新失败，清除 token 并跳转登录
        tokenStorage.clearTokens()
        window.location.href = '/#/user/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('Network Error:', error.message)
    } else {
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
  errors: string[] | null
  page: number
  pageSize: number
  totalCount: number
}

export interface PagedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export default apiClient
