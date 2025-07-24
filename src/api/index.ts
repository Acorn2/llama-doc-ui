import axios from 'axios'

// 创建axios实例
export const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 基础API响应类型
export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  message?: string
  detail?: string
}

// 导出具体API模块
export * from './modules/document'
export * from './modules/knowledge'
export * from './modules/chat'
export * from './modules/agent'
export * from './modules/monitor' 