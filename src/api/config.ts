export const API_MODE = import.meta.env.VITE_API_MODE || 'mock'

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000
}
