// 聊天相关类型
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  sequence_number: number // 消息在对话中的序号
  create_time: string
  message_metadata?: string // JSON格式的元数据，包括使用的工具、引用等
}

export interface Conversation {
  id: string
  kb_id: string
  title?: string
  create_time: string
  update_time?: string
  status: 'active' | 'archived' | 'deleted'
}

export interface CreateConversationRequest {
  kb_id: string
  title: string
}

export interface ConversationQuery {
  kb_id?: string
  skip?: number
  limit?: number
  status?: 'active' | 'archived'
}

export interface ConversationListResponse {
  items: Conversation[]
  total: number
}

export interface MessageQuery {
  conversation_id: string
  limit?: number
}

export interface MessageListResponse {
  items: Message[]
  total: number
}

export interface ChatRequest {
  conversation_id?: string
  kb_id: string
  message: string
  use_agent?: boolean
}

export interface ChatResponse {
  conversation_id: string
  message: Message
  sources?: any[]
  processing_time: number
}

export interface StreamChatData {
  conversation_id: string
  content: string
  is_final: boolean
  processing_time?: number
} 