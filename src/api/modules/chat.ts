import { api } from '../index'
import type { 
  Message, 
  Conversation, 
  ChatRequest,
  ChatResponse,
  ConversationQuery,
  ConversationListResponse,
  MessageQuery,
  MessageListResponse,
  CreateConversationRequest
} from '@/types'

export class ChatAPI {
  // 发送消息
  static async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    const response = await api.post('/api/v1/chat/send', data)
    return response.data
  }

  // 获取聊天历史
  static async getChatHistory(params?: MessageQuery): Promise<MessageListResponse> {
    const response = await api.get('/api/v1/chat/history', { params })
    return response.data
  }

  // 创建新会话
  static async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    const response = await api.post('/api/v1/conversations', data)
    return response.data
  }

  // 获取会话列表
  static async getConversations(params?: ConversationQuery): Promise<ConversationListResponse> {
    const response = await api.get('/api/v1/conversations', { params })
    return response.data
  }

  // 删除会话
  static async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/api/v1/conversations/${conversationId}`)
  }

  // 清空会话历史
  static async clearConversation(conversationId: string): Promise<void> {
    await api.post(`/api/v1/conversations/${conversationId}/clear`)
  }
} 