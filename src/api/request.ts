import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { extractErrorMessage } from '@/utils/error'

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 120000, // 增加到120秒，适应AI分析等长时间操作
  headers: {
    'Content-Type': 'application/json'
  }
})

// 获取认证头
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 检查token是否有效
const isTokenValid = () => {
  const token = localStorage.getItem('access_token')
  if (!token) return false
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 自动添加认证头
    const authHeaders = getAuthHeaders()
    config.headers = { ...config.headers, ...authHeaders }
    
    // 检查token是否过期
    if (!isTokenValid() && config.url !== '/api/v1/users/login' && config.url !== '/api/v1/users/register') {
      ElMessage.warning('登录已过期，请重新登录')
      // 可以在这里跳转到登录页面
      return Promise.reject(new Error('Token expired'))
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    const { response } = error
    
    if (response) {
      switch (response.status) {
        case 401:
          // 如果是登录接口的401错误，不显示"登录已过期"消息，让具体页面处理
          if (!error.config?.url?.includes('/api/v1/users/login')) {
            ElMessage.error('登录已过期，请重新登录')
            localStorage.removeItem('access_token')
            localStorage.removeItem('user_info')
            // 可以在这里跳转到登录页面
            // window.location.href = '/login'
          }
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 422:
          const message422 = extractErrorMessage(error, '请求参数错误')
          ElMessage.error(message422)
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          const errorMessage = extractErrorMessage(error, '请求失败')
          ElMessage.error(errorMessage)
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

// 封装常用的请求方法
export const http = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return request.get(url, config)
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return request.post(url, data, config)
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return request.put(url, data, config)
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return request.delete(url, config)
  },
  
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return request.patch(url, data, config)
  }
}

export default request