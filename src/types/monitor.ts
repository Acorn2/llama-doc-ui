// 监控相关类型
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error'
  timestamp: string
  services: {
    database: 'connected' | 'disconnected'
    vector_store: 'ready' | 'not_ready'
    llm: 'ready' | 'not_ready'
  }
}

export interface SystemInfo {
  cpu_percent: number
  memory_percent: number
  disk_percent: number
  load_average: number[]
  uptime: number
  response_time?: string
}

export interface ProcessingStatus {
  is_running: boolean
  processing_count: number
  processing_documents: string[]
}

export interface RetryStats {
  status_counts: {
    completed: number
    pending: number
    failed: number
  }
  retry_counts: Record<string, number>
  error_types: Record<string, number>
  avg_retry_count: number
  retry_success_rate: number
  total_retried_docs: number
  success_after_retry: number
}

export interface ModelInfo {
  llm_models: string[]
  embedding_models: string[]
  default_llm: string
  default_embedding: string
}

export interface DatabaseInfo {
  type: string
  version: string
  status: string
  connection_count: number
  [key: string]: any
}

export interface PerformanceMetrics {
  response_time: number[]
  throughput: number[]
  error_rate: number[]
  timestamps: string[]
}

export interface ErrorLog {
  id: string
  level: 'error' | 'warning' | 'info'
  message: string
  timestamp: string
  source: string
  count: number
} 