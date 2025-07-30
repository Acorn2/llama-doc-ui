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
    console.log('ConversationAPI.getList 原始响应:', response)
    
    // 处理不同的响应格式
    if (response.data) {
      // 如果响应有success字段，说明是包装过的响应
      if (response.data.success && response.data.data) {
        if (Array.isArray(response.data.data.conversations)) {
          return response.data.data.conversations
        } else if (Array.isArray(response.data.data)) {
          return response.data.data
        }
      }
      // 如果直接是数组
      else if (Array.isArray(response.data)) {
        return response.data
      }
      // 如果有conversations字段
      else if (response.data.conversations && Array.isArray(response.data.conversations)) {
        return response.data.conversations
      }
    }
    
    console.warn('未知的对话列表响应格式:', response.data)
    return []
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
    const token = localStorage.getItem('access_token')
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    
    const response = await fetch(`${baseURL}/api/v1/conversations/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/plain'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
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
    if (!conversationId || conversationId === 'undefined') {
      console.error('ConversationAPI.getMessages: 无效的对话ID:', conversationId)
      throw new Error('无效的对话ID')
    }
    
    console.log('ConversationAPI.getMessages 请求参数:', { conversationId, params })
    
    const response = await api.get(`/api/v1/conversations/${conversationId}/messages`, { params })
    console.log('ConversationAPI.getMessages 原始响应:', response)
    
    // 处理不同的响应格式
    if (response.data) {
      // 如果响应有success字段，说明是包装过的响应
      if (response.data.success && response.data.data) {
        if (Array.isArray(response.data.data.messages)) {
          return response.data.data.messages
        } else if (Array.isArray(response.data.data)) {
          return response.data.data
        }
      }
      // 如果直接是数组
      else if (Array.isArray(response.data)) {
        return response.data
      }
      // 如果有messages字段
      else if (response.data.messages && Array.isArray(response.data.messages)) {
        return response.data.messages
      }
    }
    
    console.warn('未知的消息列表响应格式:', response.data)
    return []
  }
}