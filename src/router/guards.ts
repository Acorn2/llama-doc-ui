import type { Router } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

export function setupRouterGuards(router: Router) {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    
    // 设置页面标题
    if (to.meta?.title) {
      document.title = `${to.meta.title} - PDF智能分析`
    }
    
    // 检查是否为公开路由
    if (to.meta?.public) {
      // 如果已登录用户访问登录/注册页面，重定向到仪表板
      if (userStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
        next('/dashboard')
        return
      }
      next()
      return
    }
    
    // 检查是否需要认证
    if (to.meta?.requiresAuth !== false) {
      // 尝试初始化认证状态
      if (!userStore.isAuthenticated) {
        const restored = userStore.initializeAuth()
        if (!restored) {
          ElMessage.warning('请先登录')
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
          return
        }
      }
      
      // 验证token是否仍然有效
      if (!userStore.isTokenValid()) {
        try {
          await userStore.refreshToken()
        } catch (error) {
          ElMessage.error('登录已过期，请重新登录')
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
          return
        }
      }
      
      // 检查用户权限
      if (to.meta?.requiresPermission) {
        const permission = to.meta.requiresPermission as string
        if (!userStore.hasPermission(permission)) {
          ElMessage.error('权限不足')
          next('/dashboard')
          return
        }
      }
    }
    
    next()
  })
  
  // 全局后置钩子
  router.afterEach((to, from) => {
    // 可以在这里添加页面访问统计等功能
    console.log(`路由导航: ${from.path} -> ${to.path}`)
  })
} 