import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/common/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '仪表板',
          icon: 'Odometer',
          keepAlive: true
        }
      },
      {
        path: '/documents',
        name: 'Documents',
        component: () => import('@/views/Documents.vue'),
        meta: {
          title: '文档管理',
          icon: 'Document',
          keepAlive: true
        }
      },
      {
        path: '/knowledge-base',
        name: 'KnowledgeBase',
        component: () => import('@/views/KnowledgeBase.vue'),
        meta: {
          title: '知识库',
          icon: 'Collection',
          keepAlive: true
        }
      },
      {
        path: '/chat',
        name: 'Chat',
        component: () => import('@/views/Chat.vue'),
        meta: {
          title: '智能对话',
          icon: 'ChatDotRound',
          keepAlive: false // 聊天页面不缓存，保持实时性
        }
      },
      {
        path: '/agent',
        name: 'Agent',
        component: () => import('@/views/Agent.vue'),
        meta: {
          title: 'AI分析',
          icon: 'MagicStick',
          keepAlive: true
        }
      },
      {
        path: '/monitor',
        name: 'Monitor',
        component: () => import('@/views/Monitor.vue'),
        meta: {
          title: '系统监控',
          icon: 'Monitor',
          keepAlive: false // 监控页面不缓存，保持数据实时性
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到'
    }
  }
] 