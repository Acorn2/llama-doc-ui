import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage, ElLoading } from 'element-plus'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求加载状态管理
let loadingInstance: any = null
let loadingCount = 0

// 显示加载
const showLoading = () => {
  if (loadingCount === 0) {
    loadingInstance = ElLoading.service({
      text: '请求处理中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  }
  loadingCount++
}

// 隐藏加载
const hideLoading = () => {
  loadingCount--
  if (loadingCount <= 0) {
    loadingCount = 0
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
  }
}

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 显示加载动画
    if (config.headers && !config.headers['no-loading']) {
      showLoading()
    }

    // 添加认证token (如果需要)
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 请求日志
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    })

    return config
  },
  (error: AxiosError) => {
    hideLoading()
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    hideLoading()

    // 响应日志
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data)

    // 检查业务状态码
    const { data } = response
    
    // 如果后端返回的是标准格式 {success: boolean, data: any, message: string}
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        ElMessage.error(data.message || '请求失败')
        return Promise.reject(new Error(data.message || '请求失败'))
      }
      return data.data // 返回实际数据
    }

    // 直接返回数据
    return data
  },
  (error: AxiosError) => {
    hideLoading()

    console.error('[API Response Error]', error)

    // 处理不同的错误状态码
    const { response } = error
    let message = '网络错误，请稍后重试'

    if (response) {
      switch (response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          // 清除token并跳转到登录页
          localStorage.removeItem('access_token')
          // router.push('/login')
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 422:
          // 处理验证错误
          if (response.data && response.data.detail) {
            if (Array.isArray(response.data.detail)) {
              message = response.data.detail.map((item: any) => item.msg).join(', ')
            } else {
              message = response.data.detail
            }
          } else {
            message = '输入数据验证失败'
          }
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = `请求失败 (${response.status})`
      }

      // 如果后端返回了错误信息，优先使用
      if (response.data && response.data.message) {
        message = response.data.message
      } else if (response.data && response.data.detail) {
        message = response.data.detail
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试'
    } else if (error.message.includes('Network Error')) {
      message = '网络连接失败，请检查网络'
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// 封装请求方法
interface RequestConfig extends AxiosRequestConfig {
  noLoading?: boolean // 是否显示加载动画
}

export const http = {
  get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    if (config?.noLoading) {
      config.headers = { ...config.headers, 'no-loading': 'true' }
    }
    return request.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    if (config?.noLoading) {
      config.headers = { ...config.headers, 'no-loading': 'true' }
    }
    return request.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    if (config?.noLoading) {
      config.headers = { ...config.headers, 'no-loading': 'true' }
    }
    return request.put(url, data, config)
  },

  delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    if (config?.noLoading) {
      config.headers = { ...config.headers, 'no-loading': 'true' }
    }
    return request.delete(url, config)
  },

  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    if (config?.noLoading) {
      config.headers = { ...config.headers, 'no-loading': 'true' }
    }
    return request.patch(url, data, config)
  }
}

export default request 