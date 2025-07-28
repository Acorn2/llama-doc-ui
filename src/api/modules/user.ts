import { api } from '../index'

// 用户相关接口
export interface LoginRequest {
  login_credential: string // 邮箱或手机号
  password: string
}

export interface RegisterRequest {
  username?: string
  email?: string
  phone?: string
  password: string
  full_name?: string
}

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

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface DashboardStats {
  document_stats: {
    total: number
    growth_rate: number
    growth_count: number
  }
  knowledge_base_stats: {
    total: number
    growth_rate: number
    growth_count: number
  }
  conversation_stats: {
    today: number
    growth_rate: number
    yesterday: number
  }
  activity_summary: {
    total_activities: number
    most_active_type: string
    recent_activities: Array<{
      activity_type: string
      count: number
      percentage: number
    }>
  }
  period: string
  last_updated: string
}

export interface UserActivity {
  id: string
  user_id: string
  activity_type: string
  activity_description: string
  resource_type?: string
  resource_id?: string
  activity_metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
  create_time: string
}

export class UserAPI {
  // 用户注册
  static async register(data: RegisterRequest): Promise<User> {
    const response = await api.post('/api/v1/users/register', data)
    return response.data
  }

  // 用户登录
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/api/v1/users/login', data)
    return response.data
  }

  // 获取当前用户信息
  static async getCurrentUser(): Promise<User> {
    const response = await api.get('/api/v1/users/me')
    return response.data
  }

  // 更新当前用户信息
  static async updateCurrentUser(data: Partial<User>): Promise<User> {
    const response = await api.put('/api/v1/users/me', data)
    return response.data
  }

  // 刷新访问令牌
  static async refreshToken(): Promise<LoginResponse> {
    const response = await api.post('/api/v1/users/refresh')
    return response.data
  }

  // 获取用户活动记录
  static async getActivities(params?: {
    limit?: number
    activity_type?: string
  }): Promise<UserActivity[]> {
    const response = await api.get('/api/v1/users/activities', { params })
    return response.data
  }

  // 获取用户活动统计
  static async getActivityStats(params?: {
    days?: number
  }): Promise<{
    success: boolean
    data: {
      total_activities: number
      activity_by_type: Record<string, number>
      period_days: number
    }
    message: string
  }> {
    const response = await api.get('/api/v1/users/activities/stats', { params })
    return response.data
  }

  // 获取仪表板统计数据
  static async getDashboardStats(params?: {
    period?: '7d' | '30d' | '90d'
  }): Promise<{
    success: boolean
    data: DashboardStats
    message: string
  }> {
    const response = await api.get('/api/v1/users/dashboard/stats', { params })
    return response.data
  }
}