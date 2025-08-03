<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import ThemeToggle from './ThemeToggle.vue'

interface Props {
  title?: string
  sidebarCollapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '仪表板',
  sidebarCollapsed: false
})

const emit = defineEmits<{
  toggleSidebar: []
}>()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 生成面包屑
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    title: item.meta?.title || '',
    path: item.path
  }))
})

const handleToggleSidebar = () => {
  emit('toggleSidebar')
}

// 用户操作菜单
const handleUserMenuClick = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}

// 用户显示名称
const displayName = computed(() => {
  if (!userStore.user) return ''
  return userStore.user.full_name || userStore.user.username || userStore.user.email?.split('@')[0] || '用户'
})
</script>

<template>
  <header class="h-16 px-4 lg:px-6 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
    <!-- 左侧：菜单按钮和标题 -->
    <div class="flex items-center space-x-4">
      <!-- 汉堡菜单按钮 -->
      <el-button
        type="text"
        @click="handleToggleSidebar"
        class="lg:hidden !p-2"
      >
        <el-icon size="20">
          <Menu />
        </el-icon>
      </el-button>
      
      <!-- 桌面端折叠按钮 -->
      <el-button
        type="text"
        @click="handleToggleSidebar"
        class="hidden lg:flex !p-2"
      >
        <el-icon size="18">
          <Fold v-if="!sidebarCollapsed" />
          <Expand v-else />
        </el-icon>
      </el-button>
      
      <!-- 页面标题 -->
      <div class="flex flex-col">
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h1>
        <!-- 面包屑导航 -->
        <nav v-if="breadcrumbs.length > 1" class="hidden sm:flex">
          <ol class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <li 
              v-for="(breadcrumb, index) in breadcrumbs" 
              :key="breadcrumb.path"
              class="flex items-center"
            >
              <span v-if="index > 0" class="mx-2">/</span>
              <span 
                :class="[
                  index === breadcrumbs.length - 1 
                    ? 'text-blue-600 dark:text-blue-400 font-medium' 
                    : 'hover:text-gray-700 dark:hover:text-gray-300'
                ]"
              >
                {{ breadcrumb.title }}
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
    
    <!-- 右侧：操作按钮 -->
    <div class="flex items-center space-x-3">
      <!-- 主题切换 -->
      <theme-toggle />
      
      <!-- 用户头像和下拉菜单 -->
      <el-dropdown trigger="click" placement="bottom-end" @command="handleUserMenuClick">
        <div class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors duration-200">
          <el-avatar 
            :size="32"
            :src="userStore.user?.avatar_url"
            class="border border-gray-200 dark:border-gray-600"
          >
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="hidden md:flex flex-col items-start">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ displayName }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ userStore.user?.email || userStore.user?.phone || '' }}
            </span>
          </div>
          <el-icon size="12" class="text-gray-400">
            <ArrowDown />
          </el-icon>
        </div>
        
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人资料
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped>
/* 确保 dropdown 在暗色主题下正确显示 */
:deep(.el-dropdown-menu) {
  @apply dark:bg-gray-800 dark:border-gray-600;
}

:deep(.el-dropdown-menu__item) {
  @apply dark:text-gray-300 dark:hover:bg-gray-700;
}

:deep(.el-dropdown-menu__item.is-divided) {
  @apply dark:border-gray-600;
}
</style> 