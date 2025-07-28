// 文档相关类型
export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'failed_permanently'
export type FileType = 'pdf' | 'txt' | 'doc' | 'docx' | 'unknown'
export type StorageType = 'local' | 'cos'

export interface Document {
  id: string
  filename: string
  file_path: string // 本地路径（向后兼容）
  file_size: number
  file_md5: string
  pages?: number
  upload_time: string
  status: DocumentStatus
  chunk_count?: number
  file_type?: FileType
  
  // 腾讯云COS相关字段
  cos_object_key?: string // COS对象键
  cos_file_url?: string   // COS文件URL
  cos_etag?: string       // COS ETag
  storage_type: StorageType // 存储类型：local/cos
  
  // 处理时间字段
  process_start_time?: string
  process_end_time?: string
  error_message?: string
  
  // 重试相关字段
  retry_count: number
  max_retries: number
  last_retry_time?: string
}

export interface DocumentQuery {
  // 分页参数（根据接口文档）
  skip?: number  // 跳过记录数 (默认: 0)
  limit?: number // 返回记录数 (默认: 20)
  
  // 搜索过滤参数
  filename?: string
  status?: DocumentStatus
  file_type?: FileType
  keyword?: string
}

export interface DocumentListResponse {
  data: {
    items: Document[]
    total: number
    page?: number
    page_size?: number
  }
}

export interface DocumentStatusInfo {
  document_id: string
  status: DocumentStatus
  progress: number
  message: string
  error_message?: string
}

export interface DownloadResponse {
  document_id: string
  filename: string
  download_url: string
  expires: string
  storage_type: string
}

export interface CheckDuplicateResponse {
  is_duplicate: boolean
  existing_document_id?: string
  message: string
}

export interface ProcessingTask {
  id: string
  document_id: string
  status: DocumentStatus
  progress: number
  created_at: string
  updated_at: string
} 