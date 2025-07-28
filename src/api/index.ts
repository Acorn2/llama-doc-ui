import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
export const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加JWT token
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 处理401未授权错误
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      // 清除本地存储的token
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_info')
      // 可以在这里跳转到登录页面
      // router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('权限不足')
    } else if (error.response?.status === 404) {
      ElMessage.error('资源不存在')
    } else if (error.response?.status >= 500) {
      ElMessage.error('服务器错误，请稍后重试')
    } else {
      // 显示具体的错误信息
      const message = error.response?.data?.detail || error.response?.data?.message || '请求失败'
      ElMessage.error(message)
    }
    return Promise.reject(error)
  }
)

// 基础API响应类型
export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  message?: string
  detail?: string
}

// 导出具体API模块
export * from './modules/document'
export * from './modules/chat'
export * from './modules/agent'
export * from './knowledge-base'
export * from './user' 