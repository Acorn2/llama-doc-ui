import { api } from '../index'

// 知识库相关接口类型定义
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

export class KnowledgeBaseAPI {
  // 创建知识库
  static async create(data: CreateKnowledgeBaseData): Promise<KnowledgeBase> {
    const response = await api.post('/api/v1/knowledge-bases/', data)
    return response.data
  }

  // 获取用户可访问的知识库列表
  static async getList(params?: { include_public?: boolean }): Promise<KnowledgeBase[]> {
    const response = await api.get('/api/v1/knowledge-bases/', { params })
    
    // 处理不同的响应结构
    const data = response.data
    if (Array.isArray(data)) {
      return data
    } else if (data && Array.isArray(data.data)) {
      return data.data
    } else if (data && Array.isArray(data.items)) {
      return data.items
    } else {
      console.warn('知识库列表API返回了未知的数据结构:', data)
      return []
    }
  }

  // 获取公开知识库列表
  static async getPublicList(params?: PublicKnowledgeBaseQuery): Promise<PublicKnowledgeBaseResponse> {
    const response = await api.get('/api/v1/knowledge-bases/public', { params })
    return response.data
  }

  // 获取知识库详情
  static async getById(kbId: string): Promise<KnowledgeBase> {
    const response = await api.get(`/api/v1/knowledge-bases/${kbId}`)
    return response.data
  }

  // 更新知识库信息
  static async update(kbId: string, data: UpdateKnowledgeBaseData): Promise<KnowledgeBase> {
    const response = await api.put(`/api/v1/knowledge-bases/${kbId}`, data)
    return response.data
  }

  // 删除知识库
  static async delete(kbId: string): Promise<void> {
    await api.delete(`/api/v1/knowledge-bases/${kbId}`)
  }

  // 切换知识库点赞状态
  static async toggleLike(kbId: string): Promise<LikeResponse> {
    const response = await api.post(`/api/v1/knowledge-bases/${kbId}/like`)
    return response.data
  }

  // 记录知识库访问行为
  static async recordAccess(kbId: string, data: {
    access_type: 'view' | 'chat'
    access_metadata?: Record<string, any>
  }): Promise<void> {
    await api.post(`/api/v1/knowledge-bases/${kbId}/access`, data)
  }

  // 添加文档到知识库
  static async addDocument(kbId: string, documentId: string): Promise<void> {
    await api.post(`/api/v1/knowledge-bases/${kbId}/documents/${documentId}`)
  }

  // 从知识库移除文档
  static async removeDocument(kbId: string, documentId: string): Promise<void> {
    await api.delete(`/api/v1/knowledge-bases/${kbId}/documents/${documentId}`)
  }

  // 列出知识库中的文档
  static async getDocuments(kbId: string, params?: {
    skip?: number
    limit?: number
  }): Promise<any[]> {
    const response = await api.get(`/api/v1/knowledge-bases/${kbId}/documents`, { params })
    return response.data
  }

  // 搜索知识库内容
  static async search(kbId: string, data: {
    query: string
    top_k?: number
    score_threshold?: number
  }): Promise<any> {
    const response = await api.post(`/api/v1/knowledge-bases/${kbId}/search`, data)
    return response.data
  }
}