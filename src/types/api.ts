// API相关类型
export interface BaseResponse<T = any> {
  success: boolean
  data: T
  message: string
  error?: string
}

export interface ListResponse<T = any> {
  items: T[]
  total: number
  page?: number
  size?: number
}

export interface UploadResponse {
  document_id: string
  filename: string
  status: string
  upload_time: string
  file_type?: string
  message: string
  storage_type?: string // 存储类型
  cos_object_key?: string // COS对象键
}

export interface ErrorResponse {
  detail: string
  status_code: number
  error_type: string
}

export interface HealthResponse {
  status: string
  timestamp: string
  service: string
  version: string
  response_time?: string
  system?: {
    cpu_percent: number
    memory_percent: number
    disk_percent: number
    load_average: number[]
  }
  uptime?: number
} 