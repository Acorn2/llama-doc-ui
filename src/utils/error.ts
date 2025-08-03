/**
 * 错误处理工具函数
 */

/**
 * 从API错误响应中提取错误消息
 * 支持多种后端错误格式：
 * 1. { success: false, error: { message: "..." } }
 * 2. { detail: "..." }
 * 3. { message: "..." }
 */
export function extractErrorMessage(error: any, defaultMessage = '操作失败'): string {
  if (!error?.response?.data) {
    return error?.message || defaultMessage
  }

  const data = error.response.data

  // 处理新的错误格式: { success: false, error: { message: "..." } }
  if (data.error?.message) {
    return data.error.message
  }

  // 处理旧的错误格式: { detail: "..." } 或 { message: "..." }
  if (data.detail) {
    return data.detail
  }

  if (data.message) {
    return data.message
  }

  return defaultMessage
}

/**
 * 处理API错误并显示消息
 */
export function handleApiError(error: any, defaultMessage = '操作失败'): string {
  const message = extractErrorMessage(error, defaultMessage)
  console.error('API错误:', error)
  return message
}