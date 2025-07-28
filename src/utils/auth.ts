/**
 * 认证相关工具函数
 */

// 获取存储的token
export const getToken = (): string | null => {
  return localStorage.getItem('access_token')
}

// 设置token
export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token)
}

// 移除token
export const removeToken = (): void => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_info')
}

// 检查token是否存在
export const hasToken = (): boolean => {
  return !!getToken()
}

// 检查token是否有效（未过期）
export const isTokenValid = (): boolean => {
  const token = getToken()
  if (!token) return false
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

// 获取认证头
export const getAuthHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 获取用户信息
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('user_info')
  return userInfo ? JSON.parse(userInfo) : null
}

// 设置用户信息
export const setUserInfo = (userInfo: any): void => {
  localStorage.setItem('user_info', JSON.stringify(userInfo))
}

// 清除所有认证信息
export const clearAuth = (): void => {
  removeToken()
}

// 检查是否已登录且token有效
export const isAuthenticated = (): boolean => {
  return hasToken() && isTokenValid()
}