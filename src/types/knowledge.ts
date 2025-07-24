// 知识库相关类型
export interface KnowledgeBase {
  id: string
  name: string
  description?: string
  create_time: string
  update_time?: string
  vector_store_name: string // 对应向量库名称
  document_count: number    // 包含的文档数量
  status: 'active' | 'archived' | 'deleted'
}

export interface CreateKBRequest {
  name: string
  description: string
}

export interface UpdateKBRequest {
  name?: string
  description?: string
}

export interface KnowledgeBaseQuery {
  skip?: number
  limit?: number
  status?: 'active' | 'archived'
  keyword?: string
}

export interface KnowledgeBaseListResponse {
  items: KnowledgeBase[]
  total: number
}

export interface KnowledgeBaseDocument {
  id: string
  kb_id: string
  document_id: string
  add_time: string
}

export interface SearchResult {
  content: string
  chunk_id: string
  chunk_index: number
  document_id: string
  similarity_score: number
  metadata: {
    keywords?: string[]
    summary?: string
    quality_score?: number
    chunk_length?: number
  }
}

export interface SearchRequest {
  query: string
  top_k?: number
  kb_id: string
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  processing_time?: number
} 