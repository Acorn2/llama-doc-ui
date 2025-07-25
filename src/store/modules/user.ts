import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { User, LoginCredentials, RegisterData, LoginResponse, UpdateUserData } from '@/types/user'
import { userApi } from '@/api/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 初始化状态（从本地存储恢复）
  const initializeAuth = () => {
    const savedToken = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user_info')
    
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
        
        // 检查token是否过期
        if (!isTokenValid()) {
          logout()
          return false
        }
        return true
      } catch (error) {
        console.error('恢复用户状态失败:', error)
        logout()
        return false
      }
    }
    return false
  }

  // 检查token是否有效
  const isTokenValid = () => {
    if (!token.value) return false
    
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      return payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }

  // 用户注册
  const register = async (registerData: RegisterData): Promise<User> => {
    try {
      const response = await userApi.register(registerData)
      ElMessage.success('注册成功！请登录')
      return response
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || '注册失败'
      ElMessage.error(message)
      throw error
    }
  }

  // 用户登录
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response: LoginResponse = await userApi.login(credentials)
      
      // 保存认证信息
      token.value = response.access_token
      user.value = response.user
      
      // 持久化到本地存储
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('user_info', JSON.stringify(response.user))
      
      ElMessage.success(`欢迎回来，${response.user.full_name || response.user.username || '用户'}！`)
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || '登录失败'
      ElMessage.error(message)
      throw error
    }
  }

  // 用户退出
  const logout = () => {
    user.value = null
    token.value = null
    
    // 清除本地存储
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
    
    ElMessage.success('已退出登录')
  }

  // 获取当前用户信息
  const getCurrentUser = async (): Promise<User> => {
    try {
      const response = await userApi.getCurrentUser()
      user.value = response
      localStorage.setItem('user_info', JSON.stringify(response))
      return response
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || '获取用户信息失败'
      ElMessage.error(message)
      throw error
    }
  }

  // 更新用户信息
  const updateUser = async (updateData: UpdateUserData): Promise<User> => {
    try {
      const response = await userApi.updateUser(updateData)
      user.value = response
      localStorage.setItem('user_info', JSON.stringify(response))
      ElMessage.success('用户信息更新成功')
      return response
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || '更新用户信息失败'
      ElMessage.error(message)
      throw error
    }
  }

  // 刷新token
  const refreshToken = async (): Promise<void> => {
    try {
      const response = await userApi.refreshToken()
      token.value = response.access_token
      user.value = response.user
      
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('user_info', JSON.stringify(response.user))
    } catch (error: any) {
      // token刷新失败，直接退出登录
      logout()
      throw error
    }
  }

  // 检查用户权限
  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false
    
    switch (permission) {
      case 'superuser':
        return user.value.is_superuser
      case 'active':
        return user.value.is_active
      default:
        return true
    }
  }

  return {
    // 状态
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    
    // 方法
    initializeAuth,
    isTokenValid,
    register,
    login,
    logout,
    getCurrentUser,
    updateUser,
    refreshToken,
    hasPermission
  }
}) 