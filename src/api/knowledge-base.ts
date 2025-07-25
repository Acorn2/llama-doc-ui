import request from './request'
import type { 
  KnowledgeBase, 
  CreateKnowledgeBaseData, 
  UpdateKnowledgeBaseData,
  PublicKnowledgeBaseQuery,
  PublicKnowledgeBaseResponse,
  LikeResponse
} from '@/types/user'

// 知识库API接口
export const knowledgeBaseApi = {
  // 创建知识库
  create: (data: CreateKnowledgeBaseData): Promise<KnowledgeBase> => {
    return request.post('/api/v1/knowledge-bases/', data)
  },

  // 获取用户可访问的知识库列表
  getList: (params?: { include_public?: boolean }): Promise<KnowledgeBase[]> => {
    return request.get('/api/v1/knowledge-bases/', { params })
  },

  // 获取公开知识库列表
  getPublicList: (params?: PublicKnowledgeBaseQuery): Promise<PublicKnowledgeBaseResponse> => {
    return request.get('/api/v1/knowledge-bases/public', { params })
  },

  // 获取知识库详情
  getById: (kbId: string): Promise<KnowledgeBase> => {
    return request.get(`/api/v1/knowledge-bases/${kbId}`)
  },

  // 更新知识库信息
  update: (kbId: string, data: UpdateKnowledgeBaseData): Promise<KnowledgeBase> => {
    return request.put(`/api/v1/knowledge-bases/${kbId}`, data)
  },

  // 删除知识库
  delete: (kbId: string): Promise<void> => {
    return request.delete(`/api/v1/knowledge-bases/${kbId}`)
  },

  // 切换知识库点赞状态
  toggleLike: (kbId: string): Promise<LikeResponse> => {
    return request.post(`/api/v1/knowledge-bases/${kbId}/like`)
  },

  // 记录知识库访问行为
  recordAccess: (kbId: string, data: {
    access_type: 'view' | 'chat'
    access_metadata?: Record<string, any>
  }): Promise<void> => {
    return request.post(`/api/v1/knowledge-bases/${kbId}/access`, data)
  },

  // 添加文档到知识库
  addDocument: (kbId: string, documentId: string): Promise<void> => {
    return request.post(`/api/v1/knowledge-bases/${kbId}/documents/${documentId}`)
  },

  // 从知识库移除文档
  removeDocument: (kbId: string, documentId: string): Promise<void> => {
    return request.delete(`/api/v1/knowledge-bases/${kbId}/documents/${documentId}`)
  },

  // 列出知识库中的文档
  getDocuments: (kbId: string, params?: {
    skip?: number
    limit?: number
  }): Promise<any[]> => {
    return request.get(`/api/v1/knowledge-bases/${kbId}/documents`, { params })
  },

  // 搜索知识库内容
  search: (kbId: string, data: {
    query: string
    top_k?: number
    score_threshold?: number
  }): Promise<any> => {
    return request.post(`/api/v1/knowledge-bases/${kbId}/search`, data)
  }
} 

// 默认导出
export default knowledgeBaseApi 