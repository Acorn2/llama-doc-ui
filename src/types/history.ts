// 查询历史相关类型
export interface QueryHistory {
  id: number
  document_id: string
  question: string
  answer: string
  confidence: number
  processing_time: number
  query_time: string
}

export interface QueryHistoryQuery {
  document_id?: string
  limit?: number
  skip?: number
  start_time?: string
  end_time?: string
}

export interface QueryHistoryListResponse {
  items: QueryHistory[]
  total: number
}