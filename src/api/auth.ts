import axios from 'axios'

const authClient = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

// Identity API 客户端（用于注册）
// 使用相对路径，通过 Vite proxy 转发到 Identity 服务
const apiClient = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// OAuth2 password grant 登录
export async function loginWithPassword(email: string, password: string) {
  const params = new URLSearchParams({
    grant_type: 'password',
    username: email, // 使用 email 作为用户名
    password,
    client_id: 'sync-client',
    client_secret: '388D45FA-B36B-4988-BA59-B187D329C207',
    scope: 'api:sync'
  })

  const response = await authClient.post('/connect/token', params)
  return response.data
}

// 用户注册
// 调用 Identity 服务的 /api/account/register
export async function registerUser(data: {
  email: string
  password: string
}) {
  const response = await apiClient.post('/api/account/register', {
    email: data.email,
    password: data.password
  })
  return response.data
}

// 刷新 token
export async function refreshToken(refreshToken: string) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: 'web-client'
  })

  const response = await authClient.post('/connect/token', params)
  return response.data
}

// 解析 JWT 获取用户信息
export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

// Token 存储
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem('openfindbearings_token'),
  getRefreshToken: () => localStorage.getItem('openfindbearings_refresh_token'),
  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('openfindbearings_token', accessToken)
    if (refreshToken) {
      localStorage.setItem('openfindbearings_refresh_token', refreshToken)
    }
  },
  clearTokens: () => {
    localStorage.removeItem('openfindbearings_token')
    localStorage.removeItem('openfindbearings_refresh_token')
    localStorage.removeItem('openfindbearings_user')
  }
}
