import request from './request'
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  LoginResponse, 
  UpdateUserData 
} from '@/types/user'

// 用户API接口
export const userApi = {
  // 用户注册
  register: (data: RegisterData): Promise<User> => {
    return request.post('/api/v1/users/register', data)
  },

  // 用户登录
  login: (data: LoginCredentials): Promise<LoginResponse> => {
    return request.post('/api/v1/users/login', data)
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<User> => {
    return request.get('/api/v1/users/me')
  },

  // 更新当前用户信息
  updateUser: (data: UpdateUserData): Promise<User> => {
    return request.put('/api/v1/users/me', data)
  },

  // 刷新访问令牌
  refreshToken: (): Promise<LoginResponse> => {
    return request.post('/api/v1/users/refresh')
  },

  // 获取用户列表（仅超级用户）
  getUserList: (params?: {
    skip?: number
    limit?: number
    is_active?: boolean
  }): Promise<User[]> => {
    return request.get('/api/v1/users/', { params })
  },

  // 获取指定用户信息（仅超级用户或本人）
  getUserById: (userId: string): Promise<User> => {
    return request.get(`/api/v1/users/${userId}`)
  },

  // 更新指定用户信息（仅超级用户）
  updateUserById: (userId: string, data: UpdateUserData): Promise<User> => {
    return request.put(`/api/v1/users/${userId}`, data)
  },

  // 禁用用户账户（仅超级用户）
  deleteUser: (userId: string): Promise<void> => {
    return request.delete(`/api/v1/users/${userId}`)
  }
} 