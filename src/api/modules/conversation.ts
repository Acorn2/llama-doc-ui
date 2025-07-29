import { api } from '../index'

// 对话相关接口类型定义
export interface Conversation {
  id: string
  user_id: string
  kb_id: string
  title: string
  create_time: string
  update_time: string
  status: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  create_time: string
}

export interface CreateConversationData {
  kb_id: string
  title: string
}

export interface ChatRequest {
  conversation_id?: string
  kb_id: string
  message: string
  use_agent?: boolean
}

export interface ChatResponse {
  conversation_id: string
  message_id: string
  content: string
  create_time: string
}

export class ConversationAPI {
  // 创建新对话
  static async create(data: CreateConversationData): Promise<Conversation> {
    const response = await api.post('/api/v1/conversations/', data)
    return response.data
  }

  // 获取对话列表
  static async getList(params?: {
    kb_id?: string
    skip?: number
    limit?: number
  }): Promise<Conversation[]> {
    const response = await api.get('/api/v1/conversations/', { params })
    return response.data
  }

  // 获取对话详情
  static async getById(conversationId: string): Promise<Conversation> {
    const response = await api.get(`/api/v1/conversations/${conversationId}`)
    return response.data
  }

  // 发送聊天消息
  static async chat(data: ChatRequest): Promise<ChatResponse> {
    const response = await api.post('/api/v1/conversations/chat', data)
    return response.data
  }

  // 流式聊天
  static async chatStream(data: ChatRequest): Promise<ReadableStream> {
    const response = await fetch('/api/v1/conversations/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.body) {
      throw new Error('No response body')
    }
    
    return response.body
  }

  // 删除对话
  static async delete(conversationId: string): Promise<void> {
    await api.delete(`/api/v1/conversations/${conversationId}`)
  }

  // 获取对话消息列表
  static async getMessages(conversationId: string, params?: {
    skip?: number
    limit?: number
  }): Promise<Message[]> {
    const response = await api.get(`/api/v1/conversations/${conversationId}/messages`, { params })
    return response.data
  }
}