import { api } from '../index'

export interface AnalysisRequest {
  kb_id: string
  query: string
  analysis_type?: 'document' | 'concept' | 'trend'
}

// 实际的后端响应结构
export interface AnalysisResponse {
  success: boolean
  data: {
    analysis: string
    processing_time: number
    query: string
    error: string | null
  }
}

// 兼容旧版本的响应结构
export interface LegacyAnalysisResponse {
  analysis_id: string
  result: string
  confidence: number
  sources: Array<{
    document_id: string
    title: string
    relevance: number
  }>
  processing_time: number
}

export interface SearchRequest {
  kb_id: string
  query: string
  limit?: number
  threshold?: number
}

export interface SearchResult {
  id: string
  title: string
  content: string
  relevance: number
  source: string
  kb_name?: string
}

export interface SearchResponse {
  success: boolean
  data: {
    results: SearchResult[]
    total: number
    processing_time: number
  }
}

export interface SummaryRequest {
  kb_id: string
  summary_type?: 'overview' | 'detailed' | 'technical'
}

export interface SummaryResponse {
  success: boolean
  data: {
    summary_id: string
    content: string
    key_topics: string[]
    document_count: number
    processing_time: number
  }
}

export class AgentAPI {
  // 智能分析 - 使用更长的超时时间
  static async analyze(data: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await api.post('/api/v1/agent/analyze', data, {
      timeout: 300000 // 5分钟超时，适应复杂的AI分析任务
    })
    return response.data
  }

  // 智能搜索
  static async search(data: SearchRequest): Promise<SearchResponse> {
    const response = await api.post('/api/v1/agent/search', data, {
      timeout: 180000 // 3分钟超时
    })
    return response.data
  }

  // 生成摘要 - 使用更长的超时时间
  static async generateSummary(data: SummaryRequest): Promise<SummaryResponse> {
    const response = await api.post('/api/v1/agent/summary', data, {
      timeout: 240000 // 4分钟超时
    })
    return response.data
  }

  // 获取分析历史
  static async getAnalysisHistory(params?: {
    kb_id?: string
    limit?: number
    skip?: number
  }): Promise<{
    items: AnalysisResponse[]
    total: number
  }> {
    const response = await api.get('/api/v1/agent/analysis/history', { params })
    return response.data
  }
} 