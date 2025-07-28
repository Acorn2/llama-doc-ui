import { api } from '../index'
import type { 
  Document, 
  DocumentQuery, 
  DocumentListResponse, 
  DocumentStatusInfo,
  UploadResponse,
  DownloadResponse,
  CheckDuplicateResponse
} from '@/types'

export class DocumentAPI {
  // 上传文档
  static async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/api/v1/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  // 获取文档列表
  static async getList(params?: DocumentQuery): Promise<DocumentListResponse> {
    // 根据接口文档，使用skip和limit参数
    const queryParams = {
      skip: params?.skip || 0,
      limit: params?.limit || 20,
      ...params
    }
    
    const response = await api.get('/api/v1/documents', { params: queryParams })
    return response.data
  }

  // 获取文档详情
  static async getDetail(documentId: string): Promise<Document> {
    const response = await api.get(`/api/v1/documents/${documentId}`)
    return response.data
  }

  // 获取文档状态
  static async getStatus(documentId: string): Promise<DocumentStatusInfo> {
    const response = await api.get(`/api/v1/documents/${documentId}/status`)
    return response.data
  }

  // 删除文档
  static async delete(documentId: string): Promise<void> {
    await api.delete(`/api/v1/documents/${documentId}`)
  }

  // 批量删除文档
  static async batchDelete(documentIds: string[]): Promise<void> {
    await api.post('/api/v1/documents/batch-delete', { document_ids: documentIds })
  }

  // 获取下载链接
  static async getDownloadUrl(documentId: string): Promise<DownloadResponse> {
    const response = await api.get(`/api/v1/documents/${documentId}/download`)
    return response.data
  }

  // 检查文档是否重复
  static async checkDuplicate(fileMd5: string): Promise<CheckDuplicateResponse> {
    const response = await api.get(`/api/v1/documents/check-duplicate/${fileMd5}`)
    return response.data
  }

  // 重新处理文档
  static async reprocess(documentId: string): Promise<void> {
    await api.post(`/api/v1/documents/${documentId}/reprocess`)
  }

  // 获取处理统计信息
  static async getProcessingStats(): Promise<{
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
  }> {
    const response = await api.get('/api/v1/documents/stats')
    return response.data
  }
} 