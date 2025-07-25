// 用户相关类型定义

export interface User {
  id: string
  username?: string
  email?: string
  phone?: string
  full_name?: string
  avatar_url?: string
  is_active: boolean
  is_superuser: boolean
  create_time: string
  update_time?: string
  last_login_time?: string
}

export interface LoginCredentials {
  login_credential: string // 邮箱或手机号
  password: string
}

export interface RegisterData {
  username?: string
  email?: string
  phone?: string
  password: string
  full_name?: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface UpdateUserData {
  username?: string
  email?: string
  phone?: string
  full_name?: string
  avatar_url?: string
  password?: string
}

// 知识库相关类型定义
export interface KnowledgeBase {
  id: string
  user_id: string
  name: string
  description?: string
  is_public: boolean
  public_description?: string
  tags: string[]
  create_time: string
  update_time?: string
  document_count: number
  status: string
  view_count: number
  like_count: number
  owner_name?: string
  is_liked?: boolean
  is_owner?: boolean
}

export interface CreateKnowledgeBaseData {
  name: string
  description?: string
  is_public?: boolean
  public_description?: string
  tags?: string[]
}

export interface UpdateKnowledgeBaseData {
  name?: string
  description?: string
  is_public?: boolean
  public_description?: string
  tags?: string[]
}

export interface PublicKnowledgeBaseQuery {
  search?: string
  tags?: string
  sort_by?: 'create_time' | 'view_count' | 'like_count'
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface PublicKnowledgeBaseResponse {
  success: boolean
  message: string
  data: {
    items: KnowledgeBase[]
    total: number
    page: number
    page_size: number
    pages: number
  }
}

export interface LikeResponse {
  success: boolean
  message: string
  is_liked: boolean
  like_count: number
}

// 对话相关类型定义
export interface Conversation {
  id: string
  user_id: string
  kb_id: string
  title?: string
  create_time: string
  update_time: string
  status: string
}

export interface CreateConversationData {
  kb_id: string
  title?: string
}

export interface ChatMessage {
  conversation_id?: string
  kb_id: string
  message: string
  use_agent?: boolean
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sequence_number: number
  create_time: string
  message_metadata?: string
} 