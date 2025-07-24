// 通用类型定义
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  error?: string
}

export interface PaginationParams {
  page: number
  size: number
  total?: number
}

export interface QueryParams {
  page?: number
  limit?: number
  skip?: number
  keyword?: string
  status?: string
  [key: string]: any
}

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
}

export interface UploadProgress {
  [fileId: string]: number
}

export interface Theme {
  mode: 'light' | 'dark'
  primaryColor: string
  [key: string]: any
}

export interface RouteMetaInfo {
  title?: string
  icon?: string
  keepAlive?: boolean
  requireAuth?: boolean
  roles?: string[]
}

// 导出所有子模块类型
export * from './api'
export * from './document'
export * from './knowledge'
export * from './chat'
export * from './agent'
export * from './monitor'
export * from './history' 