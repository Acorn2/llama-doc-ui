<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

const emit = defineEmits<{
  toggle: []
}>()

const route = useRoute()
const router = useRouter()

// 导航菜单项
const menuItems = [
  {
    name: 'Dashboard',
    title: '仪表板',
    icon: 'Odometer',
    path: '/dashboard'
  },
  {
    name: 'Documents', 
    title: '文档管理',
    icon: 'Document',
    path: '/documents'
  },
  {
    name: 'KnowledgeBase',
    title: '知识库',
    icon: 'Collection',
    path: '/knowledge-base'
  },
  {
    name: 'Chat',
    title: '智能对话',
    icon: 'ChatDotRound',
    path: '/chat'
  },
  {
    name: 'Agent',
    title: 'AI分析',
    icon: 'MagicStick', 
    path: '/agent'
  },
  {
    name: 'Monitor',
    title: '系统监控',
    icon: 'Monitor',
    path: '/monitor'
  }
]

// 当前激活的菜单项
const activeMenu = computed(() => {
  const matched = route.matched.find(item => item.name)
  return matched?.name || 'Dashboard'
})

// 处理菜单点击
const handleMenuClick = (path: string) => {
  router.push(path)
  // 移动端点击菜单后自动收起侧边栏
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    emit('toggle')
  }
}

// 侧边栏宽度类
const sidebarWidth = computed(() => {
  return props.collapsed ? 'w-16' : 'w-64'
})
</script>

<template>
  <aside 
    :class="[
      sidebarWidth,
      'h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col'
    ]"
  >
    <!-- Logo 区域 -->
    <div class="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
      <transition name="logo-fade" mode="out-in">
        <div 
          v-if="!collapsed"
          key="full-logo" 
          class="flex items-center space-x-3"
        >
          <!-- Logo图标 -->
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <el-icon size="18" class="text-white">
              <Reading />
            </el-icon>
          </div>
          <!-- Logo文字 -->
          <div class="flex flex-col">
            <span class="text-sm font-bold text-gray-900 dark:text-white">
              PDF智能分析
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Knowledge Base
            </span>
          </div>
        </div>
        
        <div 
          v-else
          key="mini-logo"
          class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
        >
          <el-icon size="18" class="text-white">
            <Reading />
          </el-icon>
        </div>
      </transition>
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 py-4 overflow-y-auto">
      <ul class="space-y-1 px-3">
        <li v-for="item in menuItems" :key="item.name">
          <button
            @click="handleMenuClick(item.path)"
            :class="[
              'w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group',
              activeMenu === item.name
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
            ]"
            :title="collapsed ? item.title : ''"
          >
            <!-- 图标 -->
            <el-icon 
              :size="20"
              :class="[
                'transition-colors duration-200',
                collapsed ? 'mx-auto' : 'mr-3',
                activeMenu === item.name 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'
              ]"
            >
              <component :is="item.icon" />
            </el-icon>
            
            <!-- 菜单文字 -->
            <transition name="menu-text" mode="out-in">
              <span 
                v-if="!collapsed"
                class="transition-all duration-200"
              >
                {{ item.title }}
              </span>
            </transition>
            
            <!-- 激活指示器 -->
            <div 
              v-if="activeMenu === item.name && !collapsed"
              class="ml-auto w-2 h-2 bg-blue-500 rounded-full"
            />
          </button>
        </li>
      </ul>
    </nav>

    <!-- 底部信息 -->
    <div 
      v-if="!collapsed" 
      class="p-4 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
        <p>© 2024 PDF智能分析服务</p>
        <p>基于大语言模型构建</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Logo 动画 */
.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: all 0.3s ease;
}

.logo-fade-enter-from,
.logo-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 菜单文字动画 */
.menu-text-enter-active,
.menu-text-leave-active {
  transition: all 0.3s ease;
}

.menu-text-enter-from,
.menu-text-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 自定义滚动条 */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: var(--color-border-secondary);
  border-radius: 2px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

/* 菜单项悬停效果增强 */
button:hover {
  transform: translateX(2px);
}

button.active {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* 渐变边框效果 */
button.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
  border-radius: 0 2px 2px 0;
}
</style> 