// Agent相关类型
export interface AgentChatRequest {
  kb_id: string
  message: string
  conversation_id?: string
  use_agent: boolean
  llm_type?: string
}

export interface AgentChatResponse {
  success: boolean
  data: {
    answer: string
    tools_used: string[]
    processing_time: number
    agent_mode: boolean
    conversation_id: string
    timestamp: string
  }
  message: string
  error?: string
}

export interface AgentAnalyzeRequest {
  kb_id: string
  query: string
  llm_type?: string
}

export interface AgentAnalyzeResponse {
  success: boolean
  data: {
    analysis: string
    query: string
    processing_time: number
  }
  error?: string
}

export interface AgentSearchRequest {
  kb_id: string
  query: string
  max_results?: number
  llm_type?: string
}

export interface AgentSearchResponse {
  success: boolean
  data: {
    results: Array<{
      content: string
      relevance_score: number
      source: string
    }>
    query: string
    processing_time: number
  }
  error?: string
}

export interface AgentSummaryRequest {
  kb_id: string
  llm_type?: string
}

export interface AgentSummaryResponse {
  success: boolean
  data: {
    summary: string
    processing_time: number
  }
  error?: string
}

export interface AgentStatus {
  success: boolean
  data: {
    kb_id: string
    llm_type: string
    is_cached: boolean
    cache_key: string
    conversation_history_count: number
    memory_enabled: boolean
    tools_count: number
  }
  error?: string
}

export interface AgentAnalysis {
  id: string
  type: 'document' | 'search' | 'summary'
  kb_id: string
  query?: string
  result: string
  processing_time: number
  created_at: string
  status: 'completed' | 'failed'
} 