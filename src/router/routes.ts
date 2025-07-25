import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  // 登录注册路由（不需要布局）
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      public: true // 公开路由，不需要认证
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: {
      title: '注册',
      public: true
    }
  },
  // 主应用布局
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/common/AppLayout.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true // 需要认证
    },
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
          title: '我的知识库',
          icon: 'Collection',
          keepAlive: true
        }
      },
      {
        path: '/knowledge-base/public',
        name: 'PublicKnowledgeBase',
        component: () => import('@/views/PublicKnowledgeBase.vue'),
        meta: {
          title: '公开知识库',
          icon: 'Share',
          keepAlive: true
        }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: {
          title: '个人资料',
          icon: 'User',
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